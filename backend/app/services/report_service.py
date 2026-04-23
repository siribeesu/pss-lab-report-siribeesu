import os
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from ..models import LabReport, Patient
from ..schemas.report import ReportCreate, ReportUpdate
from ..constants import ReportStatusEnum, UPLOAD_DIR

def compute_status(result_value, ref_range_min, ref_range_max):
    # If no result is entered, it's always Pending
    if result_value is None or result_value == "":
        return ReportStatusEnum.PENDING
    
    # If no reference ranges are provided at all, it's Pending (cannot validate)
    if ref_range_min is None and ref_range_max is None:
        return ReportStatusEnum.PENDING
    
    try:
        val = float(result_value)
        
        # Check against minimum if provided
        if ref_range_min is not None and ref_range_min != "":
            if val < float(ref_range_min):
                return ReportStatusEnum.ABNORMAL
                
        # Check against maximum if provided
        if ref_range_max is not None and ref_range_max != "":
            if val > float(ref_range_max):
                return ReportStatusEnum.ABNORMAL
                
        return ReportStatusEnum.NORMAL
    except (ValueError, TypeError):
        return ReportStatusEnum.PENDING

def create_report(db: Session, report_data: dict, file=None):
    # status calculation
    result_value = report_data.get("result_value")
    ref_min = report_data.get("ref_range_min")
    ref_max = report_data.get("ref_range_max")
    
    status = compute_status(result_value, ref_min, ref_max)
    
    file_path = None
    file_name = None
    
    if file:
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR)
        file_name = file.filename
        file_ext = os.path.splitext(file_name)[1]
        unique_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

    db_report = LabReport(
        **report_data,
        status=status,
        file_path=file_path,
        file_name=file_name
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_reports(db: Session, search=None, patient_id=None, report_type=None, status=None, date_from=None, date_to=None, skip=0, limit=100):
    query = db.query(LabReport).join(Patient, LabReport.patient_id == Patient.id)
    if search:
        query = query.filter(
            func.lower(Patient.name).contains(search.lower()) |
            func.lower(Patient.patient_id).contains(search.lower()) |
            func.lower(LabReport.report_type).contains(search.lower())
        )
    if patient_id:
        query = query.filter(LabReport.patient_id == patient_id)
    if report_type:
        query = query.filter(LabReport.report_type == report_type)
    if status:
        query = query.filter(LabReport.status == status)
    if date_from:
        query = query.filter(LabReport.report_date >= date_from)
    if date_to:
        query = query.filter(LabReport.report_date <= date_to)
    
    return query.order_by(LabReport.report_date.desc()).offset(skip).limit(limit).all()

def get_report_by_id(db: Session, report_id: str):
    if isinstance(report_id, str):
        try:
            report_id = uuid.UUID(report_id)
        except ValueError:
            return None
    return db.query(LabReport).filter(LabReport.id == report_id).first()

def update_report(db: Session, db_report: LabReport, report_update_data: dict, file=None):
    # Merge existing data with update data for status recalculation
    current_result = report_update_data.get("result_value", db_report.result_value)
    current_min = report_update_data.get("ref_range_min", db_report.ref_range_min)
    current_max = report_update_data.get("ref_range_max", db_report.ref_range_max)
    
    db_report.status = compute_status(current_result, current_min, current_max)
    
    for key, value in report_update_data.items():
        setattr(db_report, key, value)
        
    if file:
        # Delete old file if exists
        if db_report.file_path and os.path.exists(db_report.file_path):
            os.remove(db_report.file_path)
            
        file_name = file.filename
        file_ext = os.path.splitext(file_name)[1]
        unique_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        db_report.file_path = file_path
        db_report.file_name = file_name

    db.commit()
    db.refresh(db_report)
    return db_report

def delete_report(db: Session, db_report: LabReport):
    if db_report.file_path and os.path.exists(db_report.file_path):
        os.remove(db_report.file_path)
    db.delete(db_report)
    db.commit()

def get_dashboard_stats(db: Session, status_filter=None, timeframe=None):
    from datetime import timedelta
    
    q_patients = db.query(Patient)
    q_reports = db.query(LabReport)
    
    if timeframe == "Day":
        today = date.today()
        q_patients = q_patients.filter(func.date(Patient.created_at) == today)
        q_reports = q_reports.filter(func.date(LabReport.created_at) == today)
    elif timeframe == "Week":
        past_week = date.today() - timedelta(days=7)
        q_patients = q_patients.filter(func.date(Patient.created_at) >= past_week)
        q_reports = q_reports.filter(func.date(LabReport.created_at) >= past_week)
    elif timeframe == "Month":
        past_month = date.today() - timedelta(days=30)
        q_patients = q_patients.filter(func.date(Patient.created_at) >= past_month)
        q_reports = q_reports.filter(func.date(LabReport.created_at) >= past_month)

    total_patients = q_patients.count()
    total_reports = q_reports.count()
    abnormal_reports = q_reports.filter(LabReport.status == ReportStatusEnum.ABNORMAL).count()
    
    # Reports Today based on report_date (clinical date) rather than upload date
    # or if they mean upload date, using func.date() for SQLite compatibility
    reports_today = db.query(LabReport).filter(func.date(LabReport.created_at) == date.today()).count()
    
    recent_reports_query = db.query(LabReport).order_by(LabReport.created_at.desc())
    if status_filter:
        recent_reports_query = recent_reports_query.filter(LabReport.status == status_filter)
        
    recent_reports = recent_reports_query.limit(10).all()
    
    formatted_recent = []
    for r in recent_reports:
        formatted_recent.append({
            "id": r.id,
            "patient_name": r.patient.name,
            "patient_id_code": r.patient.patient_id,
            "report_type": r.report_type,
            "report_date": r.report_date,
            "status": r.status,
            "result_value": r.result_value,
            "unit": r.unit,
            "ref_range_min": r.ref_range_min,
            "ref_range_max": r.ref_range_max,
            "notes": r.notes,
            "file_path": r.file_path,
            "file_name": r.file_name
        })
        
    return {
        "total_patients": total_patients,
        "total_reports": total_reports,
        "abnormal_reports": abnormal_reports,
        "reports_today": reports_today,
        "recent_reports": formatted_recent
    }
