from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Company
from ..schemas import CompanyCreate, CompanyUpdate, CompanyResponse

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=dict)
def list_companies(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Company)

    if search:
        search_term = f"%{search}%"
        query = query.filter(Company.name.ilike(search_term))

    total = query.count()
    pages = (total + per_page - 1) // per_page

    companies = (
        query.order_by(Company.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "items": [CompanyResponse.model_validate(c) for c in companies],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(company_id: str, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.post("", response_model=CompanyResponse, status_code=201)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: str, company: CompanyUpdate, db: Session = Depends(get_db)
):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    update_data = company.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)

    db.commit()
    db.refresh(db_company)
    return db_company


@router.delete("/{company_id}", status_code=204)
def delete_company(company_id: str, db: Session = Depends(get_db)):
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    db.delete(db_company)
    db.commit()
    return None
