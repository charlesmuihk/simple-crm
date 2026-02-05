import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Numeric, Date, Enum
from sqlalchemy.orm import relationship
import enum

from .database import Base


def generate_uuid():
    return str(uuid.uuid4())


class DealStage(str, enum.Enum):
    lead = "lead"
    qualified = "qualified"
    proposal = "proposal"
    negotiation = "negotiation"
    won = "won"
    lost = "lost"


class ActivityType(str, enum.Enum):
    call = "call"
    email = "email"
    meeting = "meeting"
    note = "note"


class Company(Base):
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    website = Column(String(255), nullable=True)
    industry = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    contacts = relationship("Contact", back_populates="company")
    deals = relationship("Deal", back_populates="company")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="contacts")
    deals = relationship("Deal", back_populates="contact")
    activities = relationship("Activity", back_populates="contact")


class Deal(Base):
    __tablename__ = "deals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    value = Column(Numeric(15, 2), nullable=True)
    stage = Column(Enum(DealStage), nullable=False, default=DealStage.lead)
    contact_id = Column(String(36), ForeignKey("contacts.id"), nullable=True)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=True)
    notes = Column(Text, nullable=True)
    expected_close = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    contact = relationship("Contact", back_populates="deals")
    company = relationship("Company", back_populates="deals")
    activities = relationship("Activity", back_populates="deal")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    type = Column(Enum(ActivityType), nullable=False)
    description = Column(Text, nullable=False)
    contact_id = Column(String(36), ForeignKey("contacts.id"), nullable=True)
    deal_id = Column(String(36), ForeignKey("deals.id"), nullable=True)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    contact = relationship("Contact", back_populates="activities")
    deal = relationship("Deal", back_populates="activities")
