from pydantic import BaseModel, Field, validator
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
from ..constants import GenderEnum, ReportTypeEnum, ReportStatusEnum

class PatientBase(BaseModel):
    name: str = Field(..., min_length=2)
    age: int = Field(..., ge=1, le=150)
    gender: GenderEnum
    contact_number: str

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[GenderEnum] = None
    contact_number: Optional[str] = None

class PatientOut(PatientBase):
    id: UUID
    patient_id: str
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = { "from_attributes": True }

# Forward declaration for LabReport schema in PatientWithReports
from .report import ReportOut

class PatientWithReports(PatientOut):
    reports: List[ReportOut] = []
