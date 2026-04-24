# PSS Lab Report Manager

A professional **Patient Lab Report Management System** built for healthcare providers to efficiently manage patient information and laboratory test results. Built with modern web technologies and best practices.

**Assignment:** PSS-FSD-ASSIGN-2025 | **Status:** ✅ Complete | **Duration:** 3 Days

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Environment Variables](#environment-variables)
- [AI Usage Log](#ai-usage-log)
- [Key Features & Design Decisions](#key-features--design-decisions)
- [Edge Cases Handled](#edge-cases-handled)
- [Future Improvements](#future-improvements)

---

## 🎯 Project Overview

PSS Lab Report Manager is a full-stack web application that enables clinical staff to:

- **Register and manage patient profiles** — Create, update, and organize patient records with auto-generated PSS-XXXX IDs
- **Upload and manage lab reports** — Support for Blood Tests, Urine Tests, Lipid Panels, and custom test types with PDF/image attachments
- **Automatic status computation** — Real-time flagging of abnormal results based on reference ranges (Normal/Abnormal/Pending)
- **Comprehensive dashboard** — Monitor activity with summary statistics, recent reports, and color-coded status indicators
- **Advanced search and filtering** — Find patients and reports by name, ID, test type, date range, and status
- **Bulk data import** — CSV/XLSX upload with flexible header mapping for efficient patient registration

---

## ✨ Features

### Module 1: Patient Management
- ✅ Create patient with auto-generated PSS-XXXX ID
- ✅ List all patients with pagination
- ✅ Search patients by name or patient ID (real-time, case-insensitive)
- ✅ View individual patient profile with all associated reports
- ✅ Update patient information
- ✅ Delete patient (cascades delete all associated reports)
- ✅ Bulk upload patients from CSV/XLSX with flexible header mapping

### Module 2: Lab Report Upload & Management
- ✅ Create lab report with auto-status computation
- ✅ Supported report types: Blood Test, Urine Test, Lipid Panel, Custom
- ✅ Auto-flag abnormal results (if result outside reference range min-max)
- ✅ Status logic: Normal → Abnormal → Pending (handles all edge cases)
- ✅ Optional file upload (PDF, PNG, JPEG)
- ✅ Edit report with status recalculation
- ✅ Delete report with file cleanup
- ✅ View report with patient details

### Module 3: Dashboard
- ✅ Summary cards: Total Patients, Total Reports, Abnormal Reports, Reports Today
- ✅ Recent reports table (last 10 records with pagination)
- ✅ Color-coded status badges (green=Normal, red=Abnormal, gray=Pending)
- ✅ Filter dashboard by status
- ✅ Responsive design for mobile/tablet/desktop

### Module 4: Search & Filter
- ✅ Global search bar (patients by name/ID)
- ✅ Filter reports by Report Type
- ✅ Filter reports by Status
- ✅ Filter reports by Date Range
- ✅ Combined filtering with search

---

## 🏗️ Architecture

### Data Flow
```
React Component → Axios API Call → FastAPI Router
                                  ↓
                         Pydantic Validation → Service Layer
                                  ↓
                            SQLAlchemy ORM
                                  ↓
                          SQLite Database
```

### Folder Structure

```
pss-lab-report-antigravity/
│
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── main.py                   # FastAPI app, CORS, static files
│   │   ├── database.py               # SQLAlchemy engine, get_db()
│   │   ├── models.py                 # ORM: Patient, LabReport
│   │   ├── constants.py              # Enums (Gender, ReportType, Status)
│   │   ├── routers/                  # API Endpoints
│   │   │   ├── patients.py           # POST/GET/PUT/DELETE /patients
│   │   │   ├── reports.py            # POST/GET/PUT/DELETE /reports
│   │   │   └── dashboard.py          # GET /dashboard
│   │   ├── schemas/                  # Pydantic validation
│   │   │   ├── patient.py            # PatientCreate, PatientOut, etc.
│   │   │   └── report.py             # ReportCreate, ReportOut, etc.
│   │   └── services/                 # Business logic
│   │       ├── patient_service.py    # Patient CRUD operations
│   │       └── report_service.py     # Report logic, status computation
│   ├── db/
│   │   ├── schema.sql                # Database schema (reference)
│   │   └── lab_reports.sqlite        # SQLite database (auto-created)
│   ├── tests/
│   │   ├── conftest.py               # Pytest fixtures
│   │   ├── test_patients.py          # 14 patient tests
│   │   └── test_reports.py           # 18 report + dashboard tests
│   ├── uploads/                      # File upload directory
│   ├── .env.example                  # Environment template
│   ├── requirements.txt              # Python dependencies
│   ├── pytest.ini                    # Pytest config
│   └── Procfile                      # Gunicorn deployment
│
├── frontend/                         # React + TypeScript Frontend
│   ├── src/
│   │   ├── pages/                    # Page Components (7 pages)
│   │   │   ├── Landing.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── PatientList.tsx
│   │   │   ├── PatientDetail.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── UploadReport.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/               # Reusable Components (21)
│   │   │   ├── PatientForm.tsx
│   │   │   ├── ReportForm.tsx
│   │   │   ├── ReportTable.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── ui/                   # Base UI (8 components)
│   │   │       ├── Button, Card, Input, Select
│   │   │       ├── Dialog, Table, Badge, Toast
│   │   ├── store/                    # Zustand state (4 stores)
│   │   │   ├── patientStore.ts
│   │   │   ├── reportStore.ts
│   │   │   ├── uiStore.ts
│   │   │   └── settingsStore.ts
│   │   ├── api/                      # Axios clients
│   │   │   ├── axios.ts
│   │   │   ├── patients.ts
│   │   │   ├── reports.ts
│   │   │   └── dashboard.ts
│   │   ├── types/                    # TypeScript interfaces
│   │   ├── constants/                # App constants
│   │   ├── utils/                    # Utility functions
│   │   ├── App.tsx                   # Main app with router
│   │   └── main.tsx                  # React entry point
│   ├── public/                       # Static assets
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── hero_dashboard_mockup.png
│   ├── .env.example                  # Frontend env template
│   ├── package.json
│   ├── vite.config.js                # Vite bundler config
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── tsconfig.json                 # TypeScript strict mode
│   └── index.html
│
├── PSS_FSD_Assignment.pdf            # Original assignment
└── README.md                         # This file
```

---

## 💻 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type-safe code |
| **Vite** | Fast build tool |
| **Zustand** | State management |
| **React Router 7** | Client-side routing |
| **React Hook Form** | Form validation |
| **Tailwind CSS 4** | Styling |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|-----------|---------|
| **FastAPI** | Async web framework |
| **SQLAlchemy** | ORM |
| **Pydantic** | Data validation |
| **SQLite** | Database |
| **Pytest** | Unit testing |
| **Gunicorn** | Production server |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# API available at http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Run Tests

```bash
cd backend
pytest
# All 32 tests should pass ✓
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Key Endpoints

#### Patient Endpoints
- `POST /patients` — Create patient
- `GET /patients` — List patients (with search)
- `GET /patients/{id}` — Get patient detail
- `PUT /patients/{id}` — Update patient
- `DELETE /patients/{id}` — Delete patient
- `POST /patients/bulk_upload` — Bulk CSV/XLSX import

#### Report Endpoints
- `POST /reports` — Create report (with file upload)
- `GET /reports` — List reports (with filters)
- `GET /reports/{id}` — Get report detail
- `PUT /reports/{id}` — Update report
- `DELETE /reports/{id}` — Delete report

#### Dashboard Endpoints
- `GET /dashboard` — Get stats and recent reports
- `GET /dashboard/summary?status=Abnormal` — Filtered summary

### Status Computation Logic
```
IF result_value is NULL OR (ref_range_min AND ref_range_max are NULL):
  → "Pending"
ELSE IF result_value < ref_range_min OR result_value > ref_range_max:
  → "Abnormal"
ELSE:
  → "Normal"
```

**Example:**
```
Result: 95.5, Min: 70, Max: 110 → Normal ✓
Result: 150, Min: 70, Max: 110 → Abnormal ✗
Result: NULL, Min: 70, Max: 110 → Pending ⏳
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=sqlite:///./db/lab_reports.sqlite
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png
APP_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🧪 Testing

### Run All Tests
```bash
cd backend
pytest           # All 32 tests
pytest -v        # Verbose
pytest --cov     # Coverage report
```

### Test Coverage (32 Total)
- **Patient Tests (14):** CRUD, bulk import, search, validation
- **Report Tests (18):** Status logic, filtering, file handling, dashboard

**All tests passing ✅**

---

## 🤖 AI Usage Log

This project was developed using **Antigravity** as the AI assistant, with all code reviewed and refined manually.

| Task | Prompts | Steps | Refinements |
|------|---------|-------|------------|
| UI/UX Design | "Designing from stitch tool" | Created high-fidelity mockups and user flows | N/A |
| Architecture | "Build full-stack React + FastAPI" | Scaffolded project structure | Added service layer |
| Patient CRUD | "Auto-generate PSS-XXXX IDs, bulk import CSV" | Implemented registration logic | Improved header matching |
| Status Logic | "Auto-compute Normal/Abnormal/Pending" | Built clinical validation engine | Fixed boundary cases |
| Reports | "File upload, status recalculation, filtering" | Added document management | Optimized file cleanup |
| Dashboard | "Aggregations, recent reports, stats" | Created monitoring overview | Added timeframe filtering |
| Frontend | "21 components, responsive, TypeScript" | Built design system and pages | Enhanced mobile UI |
| Testing | "32 unit tests covering all features" | Achieved high code coverage | Extended edge case coverage |

**Key Principle:** Prompt → Review → Refine → Test

---

## 🎯 Key Features & Design Decisions

### Auto-Generated Patient IDs
**Why:** Real-world healthcare uses sequential IDs (PSS-0001, PSS-0002, etc.) for easy manual reference and tracking.

### Auto-Status Computation
**Why:** Eliminates manual flagging, ensures consistency, reduces human error in clinical workflows.

### Flexible CSV Header Matching
**Why:** Hospitals use different column names. This accepts "Patient Name", "Full Patient Name", "Name", etc., without transformation.

### Zustand over Redux
**Why:**
- Smaller bundle (50KB vs 200KB)
- Minimal boilerplate
- Perfect for medium-sized apps
- Better TypeScript support

### SQLite (Not PostgreSQL)
**Why:**
- Zero external dependencies
- File-based (easy to backup)
- Perfect for MVP/development
- Portable across machines

### Service Layer Architecture
**Why:**
- Business logic isolated from HTTP
- Easier to test
- Reusable across endpoints
- Clean separation of concerns

---

## ⚠️ Edge Cases Handled

1. **Null/Missing Values** → Pending status (not error)
2. **Boundary Values** → Result = min or max → Normal ✓
3. **Invalid Data Types** → Graceful fallback to Pending
4. **File Upload Errors** → Clear error messages
5. **Bulk Import Issues** → Processes valid rows, reports errors separately
6. **UI Empty States** → Action buttons with helpful messages
7. **Duplicate Contacts** → Allowed (per requirements)
8. **Character Encoding** → UTF-8 BOM auto-handled in CSV

---

## 📈 Future Improvements

- [ ] JWT authentication & role-based access
- [ ] Real-time updates (WebSockets)
- [ ] Email notifications for abnormal results
- [ ] PDF report generation
- [ ] Data export (CSV, PDF)
- [ ] React Testing Library tests
- [ ] Redis caching for dashboard
- [ ] APM & error tracking (Sentry)
