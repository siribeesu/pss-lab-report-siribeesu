import uuid
from sqlalchemy import Column, String, Integer, Enum, DateTime, ForeignKey, Float, Date, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base
from .constants import GenderEnum, ReportStatusEnum

class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(Enum(GenderEnum), nullable=False)
    contact_number = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    reports = relationship("LabReport", back_populates="patient", cascade="all, delete-orphan")

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    report_type = Column(String, nullable=False)
    report_date = Column(Date, nullable=False)
    result_value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    ref_range_min = Column(Float, nullable=True)
    ref_range_max = Column(Float, nullable=True)
    status = Column(Enum(ReportStatusEnum), nullable=False)
    notes = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    file_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("Patient", back_populates="reports")
