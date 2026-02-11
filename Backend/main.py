import os
import shutil
import uuid
from typing import List
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles


# Import internal modules
from database import engine, get_db
import models
import schemas
from services.analysis_service import AnalysisService
from auth import get_current_user
from utils.pdf_generator import generate_pdf_report

# Initialize Database
# Initialize Database
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Database initialization failed: {e}")

app = FastAPI(title="Quality Control Inspector API", version="0.1.0")
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Static file serving for uploads
# Accessible via http://localhost:8000/uploads/filename.jpg

# Handle read-only filesystem on Vercel (Lambda)
if os.environ.get("VERCEL"):
    print("Running on Vercel, using /tmp for uploads")
    UPLOAD_DIR = "/tmp"
else:
    UPLOAD_DIR = "uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Base URL for images
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# Initialize Analysis Service
try:
    analysis_service = AnalysisService()
except Exception as e:
    print(f"Warning: AnalysisService initialization failed: {e}")
    analysis_service = None

@app.get("/")
async def root():
    return {
        "message": "Quality Control Inspector API is running",
        "docs": "/docs",
        "health": "/health",
        "env_check": {
            "database": "OK" if engine else "Failed",
            "analysis_service": "OK" if analysis_service else "Failed (check GOOGLE_API_KEY)",
            "base_url": BASE_URL
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/upload", response_model=schemas.InspectionProfile)
async def upload_image(
    file: UploadFile = File(...), 
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload an image, analyze it using Gemini Vision, and save the result.
    """
    try:
        # 1. Save file to disk
        file_extension = os.path.splitext(file.filename)[1]
        if not file_extension:
            file_extension = ".jpg" # Default if missing
            
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 2. Analyze image
        if not analysis_service:
            # If service failed to init (e.g. missing API key), report error
            status_val = "failed"
            analysis_result = {"error": "Analysis Service not available. Check server logs."}
        else:
            try:
                print(f"Starting analysis for {file_path}")
                analysis_result = await analysis_service.analyze_image(file_path)
                
                # Determine status
                status_val = "completed"
                if analysis_result.get("error"):
                    status_val = "failed"
                    print(f"Analysis reported error: {analysis_result['error']}")
            except Exception as e:
                # Catch specific analysis errors
                status_val = "failed"
                analysis_result = {"error": str(e)}
            


        # 3. Save to database
        db_inspection = models.InspectionProfile(
            image_path=unique_filename, # Store relative path or just filename
            analysis_result=analysis_result,
            status=status_val,
            user_id=current_user_id # Use authenticated user ID
        )
        db.add(db_inspection)
        db.commit()
        db.refresh(db_inspection)
        
        db_inspection.image_url = f"{BASE_URL}/uploads/{db_inspection.image_path}"
        return db_inspection

    except Exception as e:
        print(f"Upload process error: {e}")
        # Clean up file if database save fails? Left for future improvement
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/my-inspections", response_model=List[schemas.InspectionProfile])
def get_user_inspections(
    skip: int = 0, 
    limit: int = 100, 
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a list of inspections for the currently authenticated user.
    """
    print(f"Fetching inspections for user: {current_user_id}")
    inspections = db.query(models.InspectionProfile)\
        .filter(models.InspectionProfile.user_id == current_user_id)\
        .order_by(models.InspectionProfile.created_at.desc())\
        .offset(skip).limit(limit).all()
        
    # Dynamically compute image_url
    for inspection in inspections:
        inspection.image_url = f"{BASE_URL}/uploads/{inspection.image_path}"
        
    return inspections

@app.get("/inspections", response_model=List[schemas.InspectionProfile])
def get_inspections(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get a list of all inspections, ordered by creation date (newest first).
    """
    inspections = db.query(models.InspectionProfile)\
        .order_by(models.InspectionProfile.created_at.desc())\
        .offset(skip).limit(limit).all()
        
    for inspection in inspections:
        inspection.image_url = f"{BASE_URL}/uploads/{inspection.image_path}"
        
    return inspections

@app.get("/inspections/{inspection_id}", response_model=schemas.InspectionProfile)
def get_inspection(
    inspection_id: int, 
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Get details of a specific inspection.
    """
    inspection = db.query(models.InspectionProfile).filter(models.InspectionProfile.id == inspection_id).first()
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    # Verify ownership
    if inspection.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this inspection")
        
        inspection.image_url = f"{BASE_URL}/uploads/{inspection.image_path}"
    return inspection

@app.delete("/inspections/{inspection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Delete a specific inspection and its associated image file.
    """
    inspection = db.query(models.InspectionProfile).filter(models.InspectionProfile.id == inspection_id).first()
    
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    # Verify ownership
    if inspection.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this inspection")
    
    # Delete image file
    try:
        file_path = os.path.join(UPLOAD_DIR, inspection.image_path)
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted file: {file_path}")
        else:
            print(f"File not found during deletion: {file_path}")
    except Exception as e:
        print(f"Error deleting file {inspection.image_path}: {e}")
        # Continue to delete DB record even if file deletion fails, or maybe we should raise? 
        # Usually it's better to clean up the DB even if file system is slightly out of sync or file was already gone.
    
    db.delete(inspection)
    db.commit()
    
    return None

@app.get("/inspections/{inspection_id}/export")
def export_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Export inspection details as a Markdown file.
    """
    inspection = db.query(models.InspectionProfile).filter(models.InspectionProfile.id == inspection_id).first()
    if inspection is None:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    # Verify ownership
    if inspection.user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this inspection")

    pdf_content = generate_pdf_report(inspection)
    
    filename = f"inspection_report_{inspection_id}.pdf"
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# Legacy endpoint from template
@app.get("/api/random-quote")
async def get_random_quote():
    return {"message": "Legacy endpoint"}