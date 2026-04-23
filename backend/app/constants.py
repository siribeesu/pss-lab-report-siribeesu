import os
from enum import Enum
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./db/lab_reports.sqlite")

# Upload Config
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
ALLOWED_FILE_TYPES = os.getenv("ALLOWED_FILE_TYPES", "application/pdf,image/jpeg,image/png").split(",")

# Clinical Config
PATIENT_ID_PREFIX = "PSS-"
GENDER_MAP = {
    'm': 'Male', 'male': 'Male', 'f': 'Female', 'female': 'Female', 'o': 'Other', 'other': 'Other'
}

# Environment
APP_ENV = os.getenv("APP_ENV", "development")

# Enums
class GenderEnum(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class ReportTypeEnum(str, Enum):
    BLOOD_TEST = "Blood Test"
    URINE_TEST = "Urine Test"
    LIPID_PANEL = "Lipid Panel"
    CUSTOM = "Custom"

class ReportStatusEnum(str, Enum):
    NORMAL = "Normal"
    ABNORMAL = "Abnormal"
    PENDING = "Pending"
