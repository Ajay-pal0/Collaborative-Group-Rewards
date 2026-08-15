# System Architecture

## Architectural Overview

The **Collaborative Group Rewards Platform** is built on a clean 3-tier state-machine architecture designed to process high-throughput group reward transactions, maintain strict idempotency, and provide an instant, responsive user interface.

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Tier                        │
│   React 19 + TypeScript + Vite + Tailwind CSS v4 + Axios    │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON / JWT)
┌──────────────────────────────▼──────────────────────────────┐
│                    Application Tier                         │
│   Django REST Framework (DRF 3.18) + Python 3.11            │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Domain Services:                                    │   │
│   │ - group_services: create_group, join_group          │   │
│   │ - reward_services: award_points, complete_task      │   │
│   │ - benefit_services: claim_benefit, get_states       │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQL Transactions & Locks
┌──────────────────────────────▼──────────────────────────────┐
│                       Data Tier                             │
│   PostgreSQL 15 Containerized Engine                        │
│   - Unique Constraints & Indexes                            │
│   - Row Locking (select_for_update)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Component Breakdown

### 1. Frontend Tier (React 19 + Vite)
- **State Management**: React Context (`AuthContext`, `ToastContext`) for seamless token injection and global notifications.
- **Routing**: React Router v7 providing protected routes (`AuthGuard`) and public invite token preview routes (`JoinGroupPage`).
- **HTTP Client**: Axios with request interceptors for automatic JWT header injection (`Bearer <token>`) and standard error normalization (`extractErrorMessage`).

### 2. Backend Tier (Django 6.1 + DRF)
- **Modular App Architecture**:
  - `users`: User identity, authentication, profile updates, JWT generation.
  - `groups`: Group creation, membership management, invite token generation.
  - `rewards`: Tasks, points allocation engine, benefit milestone state machine, claim validation.
  - `activities`: Audit activity feed stream.
- **Service Layer Pattern**: Business logic decoupled from view handlers into atomic, transactional service functions (`create_group`, `complete_task`, `claim_benefit`).

### 3. Data Tier (PostgreSQL 15)
- **ACID Transactions**: Wrapped in `django.db.transaction.atomic()` to guarantee that point allocation, activity logging, and membership creation execute atomically.
- **Race Condition Guard**: `select_for_update()` row-level locks on `Group` records during benefit claims prevent double-claiming under concurrent requests.
