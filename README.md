# Simple CRM

A lightweight CRM (Customer Relationship Management) system for managing contacts, companies, and deals.

## Tech Stack

- **Backend**: Python 3.10+ with FastAPI
- **Database**: SQLite
- **Interface**: REST API

## Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

### Access the API

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### Contacts
- `GET /contacts` - List all contacts (with pagination & search)
- `GET /contacts/{id}` - Get single contact
- `POST /contacts` - Create contact
- `PUT /contacts/{id}` - Update contact
- `DELETE /contacts/{id}` - Delete contact

### Companies
- `GET /companies` - List all companies
- `GET /companies/{id}` - Get single company
- `POST /companies` - Create company
- `PUT /companies/{id}` - Update company
- `DELETE /companies/{id}` - Delete company

### Deals
- `GET /deals` - List all deals (filterable by stage)
- `GET /deals/{id}` - Get single deal
- `POST /deals` - Create deal
- `PUT /deals/{id}` - Update deal
- `DELETE /deals/{id}` - Delete deal

### Activities
- `GET /activities` - List activities (filterable by contact/deal)
- `POST /activities` - Log new activity

## Data Models

### Deal Stages
`lead` → `qualified` → `proposal` → `negotiation` → `won` | `lost`

### Activity Types
`call`, `email`, `meeting`, `note`

## Example Usage

### Create a company
```bash
curl -X POST "http://localhost:8000/companies" \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "industry": "Technology"}'
```

### Create a contact
```bash
curl -X POST "http://localhost:8000/contacts" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "John", "last_name": "Doe", "email": "john@acme.com"}'
```

### Create a deal
```bash
curl -X POST "http://localhost:8000/deals" \
  -H "Content-Type: application/json" \
  -d '{"title": "Enterprise License", "value": 50000, "stage": "lead"}'
```

### Log an activity
```bash
curl -X POST "http://localhost:8000/activities" \
  -H "Content-Type: application/json" \
  -d '{"type": "call", "description": "Initial discovery call", "date": "2024-01-15T10:00:00"}'
```
