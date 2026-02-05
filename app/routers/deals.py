from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Deal, Contact, Company, DealStage
from ..schemas import DealCreate, DealUpdate, DealResponse, DealListResponse

router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("", response_model=dict)
def list_deals(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    stage: Optional[DealStage] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Deal)

    if stage:
        query = query.filter(Deal.stage == stage)

    total = query.count()
    pages = (total + per_page - 1) // per_page

    deals = (
        query.order_by(Deal.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "items": [DealListResponse.model_validate(d) for d in deals],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(deal_id: str, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.post("", response_model=DealResponse, status_code=201)
def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
    if deal.contact_id:
        contact = db.query(Contact).filter(Contact.id == deal.contact_id).first()
        if not contact:
            raise HTTPException(status_code=400, detail="Contact not found")

    if deal.company_id:
        company = db.query(Company).filter(Company.id == deal.company_id).first()
        if not company:
            raise HTTPException(status_code=400, detail="Company not found")

    db_deal = Deal(**deal.model_dump())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(deal_id: str, deal: DealUpdate, db: Session = Depends(get_db)):
    db_deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    if deal.contact_id:
        contact = db.query(Contact).filter(Contact.id == deal.contact_id).first()
        if not contact:
            raise HTTPException(status_code=400, detail="Contact not found")

    if deal.company_id:
        company = db.query(Company).filter(Company.id == deal.company_id).first()
        if not company:
            raise HTTPException(status_code=400, detail="Company not found")

    update_data = deal.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_deal, field, value)

    db.commit()
    db.refresh(db_deal)
    return db_deal


@router.delete("/{deal_id}", status_code=204)
def delete_deal(deal_id: str, db: Session = Depends(get_db)):
    db_deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not db_deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    db.delete(db_deal)
    db.commit()
    return None
