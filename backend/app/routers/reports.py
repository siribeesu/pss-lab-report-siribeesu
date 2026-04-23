from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import pandas as pd
import io
from datetime import date
from ..database import get_db
from ..schemas.report import ReportOut, ReportWithPatient
from ..services import report_service
from ..constants import PATIENT_ID_PREFIX, ReportTypeEnum

router = APIRouter(prefix="/api/reports", tags=["reports"])



@router.post("/", response_model=ReportOut)
def create_report(
    patient_id: UUID = Form(...),
    report_type: str = Form(...),
    report_date: date = Form(...),
    result_value: Optional[float] = Form(None),
    unit: Optional[str] = Form(None),
    ref_range_min: Optional[float] = Form(None),
    ref_range_max: Optional[float] = Form(None),
    notes: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # TODO: add auth dependency here
    report_data = {
        "patient_id": patient_id,
        "report_type": report_type,
        "report_date": report_date,
        "result_value": result_value,
        "unit": unit,
        "ref_range_min": ref_range_min,
        "ref_range_max": ref_range_max,
        "notes": notes
    }
    return report_service.create_report(db, report_data, file)

@router.get("/", response_model=List[ReportWithPatient])
def list_reports(
    search: Optional[str] = None,
    patient_id: Optional[UUID] = None,
    report_type: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # TODO: add auth dependency here
    return report_service.get_reports(db, search, patient_id, report_type, status, date_from, date_to, skip, limit)

@router.get("/{id}", response_model=ReportWithPatient)
def get_report(id: str, db: Session = Depends(get_db)):
    # TODO: add auth dependency here
    db_report = report_service.get_report_by_id(db, id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    return db_report

@router.put("/{id}", response_model=ReportOut)
def update_report(
    id: str,
    report_type: Optional[str] = Form(None),
    report_date: Optional[date] = Form(None),
    result_value: Optional[float] = Form(None),
    unit: Optional[str] = Form(None),
    ref_range_min: Optional[float] = Form(None),
    ref_range_max: Optional[float] = Form(None),
    notes: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # TODO: add auth dependency here
    db_report = report_service.get_report_by_id(db, id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    update_data = {}
    if report_type: update_data["report_type"] = report_type
    if report_date: update_data["report_date"] = report_date
    if result_value is not None: update_data["result_value"] = result_value
    if unit is not None: update_data["unit"] = unit
    if ref_range_min is not None: update_data["ref_range_min"] = ref_range_min
    if ref_range_max is not None: update_data["ref_range_max"] = ref_range_max
    if notes is not None: update_data["notes"] = notes

    return report_service.update_report(db, db_report, update_data, file)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(id: str, db: Session = Depends(get_db)):
    # TODO: add auth dependency here
    db_report = report_service.get_report_by_id(db, id)
    if not db_report:
        raise HTTPException(status_code=404, detail="Report not found")
    report_service.delete_report(db, db_report)
    return None
