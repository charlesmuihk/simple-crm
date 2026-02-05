from fastapi import FastAPI

from .database import engine, Base
from .routers import contacts, companies, deals, activities

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Simple CRM",
    description="A lightweight CRM system for managing contacts, companies, and deals",
    version="1.0.0",
)

# Include routers
app.include_router(contacts.router)
app.include_router(companies.router)
app.include_router(deals.router)
app.include_router(activities.router)


@app.get("/")
def root():
    return {
        "message": "Simple CRM API",
        "docs": "/docs",
        "endpoints": {
            "contacts": "/contacts",
            "companies": "/companies",
            "deals": "/deals",
            "activities": "/activities",
        },
    }
