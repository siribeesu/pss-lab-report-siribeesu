import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import patients, reports, dashboard
from .database import engine, Base

# Create tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PSS Lab Report Manager API")

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Static Files
UPLOAD_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
if not os.path.exists(UPLOAD_PATH):
    os.makedirs(UPLOAD_PATH)
app.mount("/uploads", StaticFiles(directory=UPLOAD_PATH), name="uploads")

# Include routers
app.include_router(patients.router)
app.include_router(reports.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to PSS Lab Report Manager API"}
