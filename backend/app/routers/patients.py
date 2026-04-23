from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
from datetime import date
from ..database import get_db
from ..models import Patient, LabReport
from ..schemas.patient import PatientCreate, PatientOut, PatientUpdate, PatientWithReports
from ..services import patient_service
from ..constants import PATIENT_ID_PREFIX, GENDER_MAP, ReportStatusEnum

router = APIRouter(prefix="/api/patients", tags=["patients"])

@router.post("/bulk_upload")
def bulk_upload_patients(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = file.file.read()
    filename = file.filename.lower()
    try:
        if filename.endswith('.csv'):
            # Use sep=None to auto-detect delimiter and utf-8-sig for BOM support
            df = pd.read_csv(io.BytesIO(contents), sep=None, engine='python', encoding='utf-8-sig')
        elif filename.endswith('.xlsx'):
            df = pd.read_excel(io.BytesIO(contents), engine='openpyxl')
        elif filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file format: {file.filename}. Please use .csv, .xlsx, or .xls.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

    # Normalize column names to lowercase for robust matching
    detected_cols = [str(c).strip().lower() for c in df.columns]
    df.columns = detected_cols
    
    # Optimize patient ID lookup using a targeted MAX query
    max_pid = db.query(func.max(Patient.patient_id)).filter(Patient.patient_id.like(f"{PATIENT_ID_PREFIX}%")).scalar()
    next_num_sequence = 1
    if max_pid:
        try:
            next_num_sequence = int(max_pid.split("-")[1]) + 1
        except (IndexError, ValueError):
            next_num_sequence = 1

    added_count = 0
    errors = []


    for index, row in df.iterrows():
        try:
            # Ultra-flexible field extraction with comprehensive fallback mapping
            name = str(
                row.get('full patient name') or row.get('name') or 
                row.get('patient name') or row.get('full name') or 
                row.get('patient_name') or row.get('name_of_patient') or 
                row.get('pname') or row.get('patient') or ''
            ).strip()
            
            if not name or name.lower() == 'nan' or name == 'none':
                continue
                
            # Improved age conversion with alternative headers
            age_raw = row.get('age') or row.get('patient age') or row.get('patient_age') or 0
            try:
                age = int(float(age_raw)) if pd.notnull(age_raw) else 0
            except:
                age = 0
            
            # Flexible gender mapping
            raw_gender = str(row.get('gender') or row.get('sex') or row.get('patient gender') or 'Other').strip().lower()
            mapped_gender = GENDER_MAP.get(raw_gender, 'Other')
            
            # Generate patient_id manually to save DB overhead
            current_pid = f"{PATIENT_ID_PREFIX}{str(next_num_sequence).zfill(4)}"
            
            patient_data = {
                "name": name,
                "age": age,
                "gender": mapped_gender,
                "contact_number": str(row.get('contact number') or row.get('contact_number') or row.get('contact') or row.get('phone') or row.get('mobile') or '').strip(),
                "patient_id": current_pid
            }
            
            new_patient = Patient(**patient_data)
            db.add(new_patient)
            db.flush() # Get the ID without full commit yet
            
            next_num_sequence += 1
            added_count += 1
            
        except Exception as e:
            db.rollback() # Reset session state if a row fails (e.g. duplicate key)
            errors.append(f"Row {index + 2}: {str(e)}")

    db.commit() # Single commit for all rows for 10x speed
    return {
        "message": f"Bulk import complete. Processed {added_count} records. Detected Columns: {', '.join(detected_cols)}", 
        "errors": errors, 
        "added_count": added_count
    }

@router.post("/", response_model=PatientOut)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    # TODO: add auth dependency here
    return patient_service.create_patient(db, patient)

@router.get("/", response_model=List[PatientOut])
def list_patients(search: str = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # TODO: add auth dependency here
    return patient_service.get_patients(db, search, skip, limit)

@router.get("/{id}", response_model=PatientWithReports)
def get_patient(id: str, db: Session = Depends(get_db)):
    # TODO: add auth dependency here
    db_patient = patient_service.get_patient_by_id(db, id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient

@router.put("/{id}", response_model=PatientOut)
def update_patient(id: str, patient_update: PatientUpdate, db: Session = Depends(get_db)):
    # TODO: add auth dependency here
    db_patient = patient_service.get_patient_by_id(db, id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient_service.update_patient(db, db_patient, patient_update)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(id: str, db: Session = Depends(get_db)):
    # TODO: add auth dependency here
    db_patient = patient_service.get_patient_by_id(db, id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient_service.delete_patient(db, db_patient)
    return None
