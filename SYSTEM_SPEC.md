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

## 6. Data Access & API Design

Data access is handled directly via the Supabase client (`@supabase/supabase-js`). No custom REST API is needed — the frontend communicates with Supabase's auto-generated PostgREST API and Auth endpoints.

### Authentication

Supabase Auth handles user management, login, and session tokens.

| Operation       | Method                                      |
|-----------------|---------------------------------------------|
| Sign up         | `supabase.auth.signUp({ email, password })` |
| Sign in         | `supabase.auth.signInWithPassword({ email, password })` |
| Sign out        | `supabase.auth.signOut()`                   |
| Get session     | `supabase.auth.getSession()`                |
| Get current user| `supabase.auth.getUser()`                   |

### Data Operations

All CRUD operations use the Supabase client query builder:

```typescript
// List with pagination and filtering
const { data, error } = await supabase
  .from('contacts')
  .select('*, company:companies(name)')
  .order('created_at', { ascending: false })
  .range(0, 24)

// Get by ID
const { data, error } = await supabase
  .from('contacts')
  .select('*, company:companies(*), activities(*)')
  .eq('id', contactId)
  .single()

// Create
const { data, error } = await supabase
  .from('contacts')
  .insert({ first_name, last_name, email, ... })
  .select()
  .single()

// Update
const { data, error } = await supabase
  .from('contacts')
  .update({ first_name, last_name, ... })
  .eq('id', contactId)
  .select()
  .single()

// Delete
const { error } = await supabase
  .from('contacts')
  .delete()
  .eq('id', contactId)
```

### Row Level Security

Supabase RLS policies enforce role-based access at the database level:
- **Agents** can only read/write their own contacts, deals, and activities (`owner_id = auth.uid()`)
- **Managers** can read all data, reassign deals
- **Admins** have full access to all data and user management

### Filtering & Search

Queries use the Supabase client's filter methods:
- `.eq()`, `.neq()`, `.in()` for exact matches
- `.ilike()` for text search (e.g., `q` parameter)
- `.order()` for sorting
- `.range()` for pagination

## 7. Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 15 (App Router) with TypeScript |
| UI Library | shadcn/ui + Tailwind CSS          |
| Backend    | Supabase (hosted BaaS)            |
| Database   | Supabase PostgreSQL               |
| DB Client  | @supabase/supabase-js             |
| Auth       | Supabase Auth                     |
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
├── frontend/                    # Next.js 15 App Router
│   ├── app/
│   │   ├── layout.tsx           # Root layout with sidebar nav
│   │   ├── page.tsx             # Dashboard
│   │   ├── contacts/
│   │   │   ├── page.tsx         # Contact list
│   │   │   ├── new/page.tsx     # Create contact
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Contact detail
│   │   │       └── edit/page.tsx# Edit contact
│   │   ├── companies/
│   │   │   ├── page.tsx         # Company list
│   │   │   ├── new/page.tsx     # Create company
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Company detail
│   │   │       └── edit/page.tsx# Edit company
│   │   ├── deals/
│   │   │   ├── page.tsx         # Deal list / pipeline view
│   │   │   ├── new/page.tsx     # Create deal
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Deal detail
│   │   │       └── edit/page.tsx# Edit deal
│   │   └── activities/
│   │       ├── page.tsx         # Activity list
│   │       └── new/page.tsx     # Create activity
│   ├── components/              # Shared UI components
│   │   ├── ui/                  # shadcn/ui primitives
│   │   ├── sidebar.tsx          # Sidebar navigation
│   │   ├── data-table.tsx       # Reusable data table
│   │   └── ...
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── types.ts             # TypeScript types (DB schema)
│   │   └── utils.ts             # Helper functions
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
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
