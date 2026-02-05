from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Activity, Contact, Deal
from ..schemas import ActivityCreate, ActivityResponse

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("", response_model=dict)
def list_activities(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    contact_id: Optional[str] = None,
    deal_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Activity)

    if contact_id:
        query = query.filter(Activity.contact_id == contact_id)
    if deal_id:
        query = query.filter(Activity.deal_id == deal_id)

    total = query.count()
    pages = (total + per_page - 1) // per_page

    activities = (
        query.order_by(Activity.date.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "items": [ActivityResponse.model_validate(a) for a in activities],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.post("", response_model=ActivityResponse, status_code=201)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    if activity.contact_id:
        contact = db.query(Contact).filter(Contact.id == activity.contact_id).first()
        if not contact:
            raise HTTPException(status_code=400, detail="Contact not found")

    if activity.deal_id:
        deal = db.query(Deal).filter(Deal.id == activity.deal_id).first()
        if not deal:
            raise HTTPException(status_code=400, detail="Deal not found")

    db_activity = Activity(**activity.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity
