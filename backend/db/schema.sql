-- PSS Lab Report Manager Database Schema

-- Enums (PostgreSQL specific)
CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE report_type_enum AS ENUM ('Blood Test', 'Urine Test', 'Lipid Panel', 'Custom');
CREATE TYPE report_status_enum AS ENUM ('Normal', 'Abnormal', 'Pending');

-- Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
    gender gender_enum NOT NULL,
    contact_number VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_patient_id ON patients(patient_id);

-- Lab Reports Table
CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    report_type report_type_enum NOT NULL,
    report_date DATE NOT NULL,
    result_value FLOAT,
    unit VARCHAR,
    ref_range_min FLOAT,
    ref_range_max FLOAT,
    status report_status_enum NOT NULL,
    notes TEXT,
    file_path VARCHAR,
    file_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
