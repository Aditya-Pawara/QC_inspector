from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class InspectionProfile(Base):
    __tablename__ = "inspection_profiles"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String, nullable=False)
    
    # Store the full analysis output: defects, severity breakdown, quality issues, recommendations
    analysis_result = Column(JSON, nullable=True)
    
    # Status of the inspection: 'pending', 'completed', 'failed'
    status = Column(String, default="pending")
    
    # User reference
    user_id = Column(String, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
