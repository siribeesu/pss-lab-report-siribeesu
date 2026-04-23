import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from ..models import Patient
from ..schemas.patient import PatientCreate, PatientUpdate

def generate_patient_id(db: Session):
    all_pids = [p.patient_id for p in db.query(Patient).all() if p.patient_id and p.patient_id.startswith("PSS-")]
    if not all_pids:
        return "PSS-0001"
    nums = []
    for pid in all_pids:
        try:
            nums.append(int(pid.split("-")[1]))
        except Exception:
            pass
    next_num = max(nums) + 1 if nums else 1
    return f"PSS-{str(next_num).zfill(4)}"

def create_patient(db: Session, patient_data: PatientCreate):
    patient_id = generate_patient_id(db)
    db_patient = Patient(
        **patient_data.model_dump(),
        patient_id=patient_id
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def get_patients(db: Session, search: str = None, skip: int = 0, limit: int = 100):
    query = db.query(Patient)
    if search:
        query = query.filter(
            or_(
                Patient.name.ilike(f"%{search}%"),
                Patient.patient_id.ilike(f"%{search}%")
            )
        )
    return query.offset(skip).limit(limit).all()

def get_patient_by_id(db: Session, patient_id: str):
    if isinstance(patient_id, str):
        try:
            patient_id = uuid.UUID(patient_id)
        except ValueError:
            return None
    return db.query(Patient).filter(Patient.id == patient_id).first()

def update_patient(db: Session, db_patient: Patient, patient_update: PatientUpdate):
    update_data = patient_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_patient, key, value)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def delete_patient(db: Session, db_patient: Patient):
    import os
    # Delete associated report files
    for report in db_patient.reports:
        if report.file_path and os.path.exists(report.file_path):
            try:
                os.remove(report.file_path)
            except Exception as e:
                print(f"Error deleting file {report.file_path}: {e}")
                
    db.delete(db_patient)
    db.commit()
