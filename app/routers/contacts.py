from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import Contact, Company
from ..schemas import ContactCreate, ContactUpdate, ContactResponse, ContactListResponse

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=dict)
def list_contacts(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Contact)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Contact.first_name.ilike(search_term),
                Contact.last_name.ilike(search_term),
                Contact.email.ilike(search_term),
            )
        )

    total = query.count()
    pages = (total + per_page - 1) // per_page

    contacts = (
        query.order_by(Contact.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "items": [ContactListResponse.model_validate(c) for c in contacts],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: str, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.post("", response_model=ContactResponse, status_code=201)
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    if contact.company_id:
        company = db.query(Company).filter(Company.id == contact.company_id).first()
        if not company:
            raise HTTPException(status_code=400, detail="Company not found")

    db_contact = Contact(**contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: str, contact: ContactUpdate, db: Session = Depends(get_db)
):
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    if contact.company_id:
        company = db.query(Company).filter(Company.id == contact.company_id).first()
        if not company:
            raise HTTPException(status_code=400, detail="Company not found")

    update_data = contact.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_contact, field, value)

    db.commit()
    db.refresh(db_contact)
    return db_contact


@router.delete("/{contact_id}", status_code=204)
def delete_contact(contact_id: str, db: Session = Depends(get_db)):
    db_contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(db_contact)
    db.commit()
    return None
