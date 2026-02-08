# Simple CRM System - System Specification

## 1. Overview

A lightweight Customer Relationship Management (CRM) system for small businesses to manage contacts, companies, deals, and interactions in one place.

## 2. Goals

- Centralize customer and prospect data
- Track sales pipeline and deal progress
- Log interactions (calls, emails, meetings) with contacts
- Provide a clean, simple interface that requires minimal training

## 3. Users and Roles

| Role       | Description                                      |
|------------|--------------------------------------------------|
| **Admin**  | Full access. Manages users, settings, and all data. |
| **Manager**| Views all data. Can reassign deals and pull reports. |
| **Agent**  | Manages own contacts, deals, and activities.       |

## 4. Core Entities

### 4.1 Contact

A person the business interacts with.

| Field        | Type     | Required | Notes                       |
|--------------|----------|----------|-----------------------------|
| id           | UUID     | auto     | Primary key                 |
| first_name   | string   | yes      |                             |
| last_name    | string   | yes      |                             |
| email        | string   | no       | Unique if provided          |
| phone        | string   | no       |                             |
| company_id   | UUID     | no       | FK to Company               |
| owner_id     | UUID     | yes      | FK to User (assigned agent) |
| notes        | text     | no       |                             |
| created_at   | datetime | auto     |                             |
| updated_at   | datetime | auto     |                             |

### 4.2 Company

An organization that one or more contacts belong to.

| Field        | Type     | Required | Notes           |
|--------------|----------|----------|-----------------|
| id           | UUID     | auto     | Primary key     |
| name         | string   | yes      | Unique          |
| industry     | string   | no       |                 |
| website      | string   | no       |                 |
| address      | text     | no       |                 |
| created_at   | datetime | auto     |                 |
| updated_at   | datetime | auto     |                 |

### 4.3 Deal

A potential sale being tracked through the pipeline.

| Field        | Type     | Required | Notes                          |
|--------------|----------|----------|--------------------------------|
| id           | UUID     | auto     | Primary key                    |
| title        | string   | yes      |                                |
| value        | decimal  | no       | Monetary value of the deal     |
| currency     | string   | no       | Default: USD                   |
| stage        | enum     | yes      | See Pipeline Stages below      |
| contact_id   | UUID     | yes      | FK to Contact                  |
| company_id   | UUID     | no       | FK to Company                  |
| owner_id     | UUID     | yes      | FK to User (assigned agent)    |
| expected_close_date | date | no   |                                |
| closed_at    | datetime | no       | Set when Won or Lost           |
| created_at   | datetime | auto     |                                |
| updated_at   | datetime | auto     |                                |

**Pipeline Stages:**

```
Lead -> Qualified -> Proposal -> Negotiation -> Won | Lost
```

### 4.4 Activity

A logged interaction or task tied to a contact or deal.

| Field        | Type     | Required | Notes                              |
|--------------|----------|----------|------------------------------------|
| id           | UUID     | auto     | Primary key                        |
| type         | enum     | yes      | call, email, meeting, note, task   |
| subject      | string   | yes      |                                    |
| description  | text     | no       |                                    |
| contact_id   | UUID     | no       | FK to Contact                      |
| deal_id      | UUID     | no       | FK to Deal                         |
| owner_id     | UUID     | yes      | FK to User                         |
| due_date     | datetime | no       | For tasks                          |
| completed    | boolean  | no       | Default: false                     |
| created_at   | datetime | auto     |                                    |

### 4.5 User

A system user (agent, manager, or admin).

| Field        | Type     | Required | Notes                  |
|--------------|----------|----------|------------------------|
| id           | UUID     | auto     | Primary key            |
| name         | string   | yes      |                        |
| email        | string   | yes      | Unique, used for login |
| password     | string   | yes      | Stored as bcrypt hash  |
| role         | enum     | yes      | admin, manager, agent  |
| active       | boolean  | yes      | Default: true          |
| created_at   | datetime | auto     |                        |

## 5. Key Features

### 5.1 Contact Management
- Create, view, edit, and delete contacts
- Associate contacts with a company
- View activity history for a contact
- Search and filter contacts by name, email, company, or owner

### 5.2 Company Management
- Create, view, edit, and delete companies
- View all contacts belonging to a company
- View all deals associated with a company

### 5.3 Deal Pipeline
- Create and manage deals through pipeline stages
- Drag-and-drop Kanban board view of the pipeline
- Filter deals by stage, owner, value, or expected close date
- Dashboard summary: total deals, total value per stage, win rate

### 5.4 Activity Tracking
- Log calls, emails, meetings, and notes against contacts or deals
- Create tasks with due dates
- Activity timeline view on contact and deal detail pages

### 5.5 Dashboard
- Summary cards: total contacts, open deals, total pipeline value, deals won this month
- Recent activity feed
- Deals closing soon (next 7 / 30 days)

### 5.6 Search
- Global search across contacts, companies, and deals

## 6. API Design

RESTful JSON API. All endpoints require authentication via JWT.

### Authentication
| Method | Endpoint          | Description        |
|--------|-------------------|--------------------|
| POST   | /api/auth/login   | Login, returns JWT |
| POST   | /api/auth/logout  | Invalidate token   |

### Contacts
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/contacts         | List (paginated)     |
| POST   | /api/contacts         | Create               |
| GET    | /api/contacts/:id     | Get by ID            |
| PUT    | /api/contacts/:id     | Update               |
| DELETE | /api/contacts/:id     | Delete               |

### Companies
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/companies        | List (paginated)     |
| POST   | /api/companies        | Create               |
| GET    | /api/companies/:id    | Get by ID            |
| PUT    | /api/companies/:id    | Update               |
| DELETE | /api/companies/:id    | Delete               |

### Deals
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/deals            | List (paginated)     |
| POST   | /api/deals            | Create               |
| GET    | /api/deals/:id        | Get by ID            |
| PUT    | /api/deals/:id        | Update               |
| PATCH  | /api/deals/:id/stage  | Move to a new stage  |
| DELETE | /api/deals/:id        | Delete               |

### Activities
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/activities       | List (paginated)     |
| POST   | /api/activities       | Create               |
| GET    | /api/activities/:id   | Get by ID            |
| PUT    | /api/activities/:id   | Update               |
| DELETE | /api/activities/:id   | Delete               |

### Users (Admin only)
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/users            | List                 |
| POST   | /api/users            | Create               |
| GET    | /api/users/:id        | Get by ID            |
| PUT    | /api/users/:id        | Update               |

### Dashboard
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/dashboard        | Summary stats and feed   |

### Pagination & Filtering

All list endpoints support:
- `page` and `per_page` query params (default: page=1, per_page=25)
- `sort` and `order` (e.g., `?sort=created_at&order=desc`)
- Entity-specific filters (e.g., `?stage=proposal&owner_id=<uuid>`)
- `q` for text search

## 7. Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React with TypeScript             |
| UI Library | Tailwind CSS                      |
| Backend    | Node.js with Express              |
| Database   | PostgreSQL                        |
| ORM        | Prisma                            |
| Auth       | JWT (access + refresh tokens)     |
| Validation | Zod (shared schemas)              |
| Testing    | Vitest (unit), Playwright (e2e)   |

## 8. Non-Functional Requirements

| Requirement    | Target                                          |
|----------------|-------------------------------------------------|
| Performance    | API responses < 200ms for typical queries       |
| Scalability    | Support up to 100 concurrent users              |
| Security       | HTTPS, hashed passwords, role-based access, CSRF protection |
| Data Retention | Soft-delete for contacts and deals              |
| Backup         | Daily automated database backups                |
| Availability   | 99.5% uptime target                             |

## 9. Project Structure

```
simple-crm/
├── frontend/            # React app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API client functions
│   │   ├── types/       # TypeScript type definitions
│   │   └── utils/       # Helper functions
│   └── ...
├── backend/             # Express API
│   ├── src/
│   │   ├── routes/      # Route handlers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helper functions
│   ├── prisma/
│   │   └── schema.prisma
│   └── ...
└── SYSTEM_SPEC.md
```

## 10. Milestones

1. **Project setup** - Repo init, tooling, database schema, seed data
2. **Auth & users** - Login, JWT, role middleware, user CRUD
3. **Contacts & companies** - CRUD, search, association
4. **Deals & pipeline** - CRUD, stage transitions, Kanban board
5. **Activities** - Logging, timeline views
6. **Dashboard & search** - Summary stats, global search
7. **Polish & deploy** - Error handling, responsive UI, CI/CD, deployment
