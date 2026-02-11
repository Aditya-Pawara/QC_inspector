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
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Quality Control Inspector API", version="0.1.0")
# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Static file serving for uploads
# Accessible via http://localhost:8000/uploads/filename.jpg
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Initialize Analysis Service
analysis_service = AnalysisService()

@app.get("/")
async def root():
    return {"message": "Quality Control Inspector API is running"}

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
        try:
            print(f"Starting analysis for {file_path}")
            analysis_result = await analysis_service.analyze_image(file_path)
            
            # Determine status
            status_val = "completed"
            if analysis_result.get("error"):
                status_val = "failed"
                print(f"Analysis reported error: {analysis_result['error']}")
            
        except Exception as e:
            print(f"Analysis failed with exception: {e}")
            analysis_result = {"error": str(e)}
            status_val = "failed"

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
        
        db_inspection.image_url = f"http://localhost:8000/uploads/{db_inspection.image_path}"
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
        inspection.image_url = f"http://localhost:8000/uploads/{inspection.image_path}"
        
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
        inspection.image_url = f"http://localhost:8000/uploads/{inspection.image_path}"
        
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
        
    inspection.image_url = f"http://localhost:8000/uploads/{inspection.image_path}"
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