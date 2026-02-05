from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

from .models import DealStage, ActivityType


# Company Schemas
class CompanyBase(BaseModel):
    name: str
    website: Optional[str] = None
    industry: Optional[str] = None
    notes: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    notes: Optional[str] = None


class CompanyResponse(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


# Contact Schemas
class ContactBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company_id: Optional[str] = None
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_id: Optional[str] = None
    notes: Optional[str] = None


class ContactResponse(ContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
    company: Optional[CompanyResponse] = None


class ContactListResponse(ContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


# Deal Schemas
class DealBase(BaseModel):
    title: str
    value: Optional[Decimal] = None
    stage: DealStage = DealStage.lead
    contact_id: Optional[str] = None
    company_id: Optional[str] = None
    notes: Optional[str] = None
    expected_close: Optional[date] = None


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: Optional[str] = None
    value: Optional[Decimal] = None
    stage: Optional[DealStage] = None
    contact_id: Optional[str] = None
    company_id: Optional[str] = None
    notes: Optional[str] = None
    expected_close: Optional[date] = None


class DealResponse(DealBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
    contact: Optional[ContactListResponse] = None
    company: Optional[CompanyResponse] = None


class DealListResponse(DealBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


# Activity Schemas
class ActivityBase(BaseModel):
    type: ActivityType
    description: str
    contact_id: Optional[str] = None
    deal_id: Optional[str] = None
    date: datetime


class ActivityCreate(ActivityBase):
    pass


class ActivityResponse(ActivityBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime


# Pagination
class PaginatedResponse(BaseModel):
    items: List
    total: int
    page: int
    per_page: int
    pages: int
