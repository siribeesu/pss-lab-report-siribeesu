from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from ..constants import ReportStatusEnum

class ReportBase(BaseModel):
    report_type: str
    report_date: date
    result_value: Optional[float] = None
    unit: Optional[str] = None
    ref_range_min: Optional[float] = None
    ref_range_max: Optional[float] = None
    notes: Optional[str] = Field(None, max_length=500)

class ReportCreate(ReportBase):
    patient_id: UUID

class ReportUpdate(BaseModel):
    report_type: Optional[str] = None
    report_date: Optional[date] = None
    result_value: Optional[float] = None
    unit: Optional[str] = None
    ref_range_min: Optional[float] = None
    ref_range_max: Optional[float] = None
    notes: Optional[str] = None

class ReportOut(ReportBase):
    id: UUID
    patient_id: UUID
    status: ReportStatusEnum
    file_path: Optional[str]
    file_name: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = { "from_attributes": True }

# For listing reports with patient info
class PatientShort(BaseModel):
    id: UUID
    name: str
    patient_id: str

    model_config = { "from_attributes": True }

class ReportWithPatient(ReportOut):
    patient: PatientShort
