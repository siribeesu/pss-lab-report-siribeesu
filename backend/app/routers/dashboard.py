from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services import report_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/")
def get_dashboard(timeframe: str = None, db: Session = Depends(get_db)):
    # TODO: add auth dependency here
    return report_service.get_dashboard_stats(db, timeframe=timeframe)

@router.get("/summary")
def get_dashboard_summary(status: str = None, db: Session = Depends(get_db)):
    # TODO: add auth dependency here
    return report_service.get_dashboard_stats(db, status_filter=status)
