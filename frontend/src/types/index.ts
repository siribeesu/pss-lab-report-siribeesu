export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact_number: string;
  created_at?: string;
  updated_at?: string;
  reports?: LabReport[];
}

export interface LabReport {
  id: string;
  patient_id: string;
  report_type: string;
  report_date: string;
  result_value?: number;
  unit?: string;
  ref_range_min?: number;
  ref_range_max?: number;
  status: 'Normal' | 'Abnormal' | 'Pending';
  notes?: string;
  file_path?: string;
  file_name?: string;
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
}

export interface DashboardStats {
  total_patients: number;
  total_reports: number;
  abnormal_reports: number;
  reports_today: number;
  recent_reports: LabReport[];
}

export interface ReportTypeConfig {
  name: string;
  min: number | null;
  max: number | null;
  unit: string;
}
