from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class InspectionProfileBase(BaseModel):
    image_path: str
    status: str
    user_id: Optional[str] = None
    analysis_result: Optional[Dict[str, Any]] = None

class InspectionProfileCreate(InspectionProfileBase):
    pass

class InspectionProfile(InspectionProfileBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True # Updated for Pydantic V2
