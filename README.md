# Collaborative Group Rewards Prototype

A full-stack, state-machine web application designed for group-level point aggregation, personal task completions, idempotent transaction processing, and atomic benefit milestone unlocks.

---

## Overview

**Collaborative Group Rewards** is a social reward platform where users form private groups (Friends, Family, Colleagues, Other) to complete personal actions and collectively accumulate points to unlock shared rewards and benefits. 

The core architectural paradigm is the **Collaborative Reward Model**:
- **Task Completion is Personal**: Each member can complete a specific task once per group.
- **Reward Accumulation is Shared**: Every completed task awards points directly to the group's aggregate total.
- **Benefit Unlocking is Group-Wide & Claiming is Per-User**: When group total points reach defined thresholds (e.g., 200 pts, 500 pts, 1000 pts), benefits unlock for all group members, and every active member can claim unlocked benefits for themselves (claiming benefits does not add points to group total).

---

## Product Flow

```
User 1 (Owner)
  │
  ├─► Register / Login
  ├─► Create Group ("Collaborative Group Rewards Pioneers") ──► [+100 Group Points]
  ├─► Generate Invite Link ───────────────► [+25 Group Points]
  └─► Copy & Share Invite Link
         │
User 2 (Participant)
  │
  ├─► Open Invite Link & Preview Group Info
  ├─► Join Group ─────────────────────────► [+100 Group Points]
  ├─► Complete Profile Details ───────────► [+50 Group Points]
  │
Task Execution Phase
  │
  ├─► User 1 completes Task A ("Complete Security Audit") ──► [+150 Group Points]
  │   └──► User 2 sees Task A still available for themselves
  ├─► User 2 completes Task A ("Complete Security Audit") ──► [+150 Group Points]
  │   └──► Total Group Points increase by +300 points from Task A
  │
Benefit Unlock & Activity Feed Phase
  │
  ├─► Group Points reach unlock threshold (e.g., 500 pts)
  ├─► Benefits change state: LOCKED ──► AVAILABLE
  ├─► User 1 & User 2 can each claim unlocked benefit for themselves ──► Status: CLAIMED (per-user)
  └─► Activity feed logs every event in real-time
```

---

## Key Features

1. **User Identity & Auth**: SimpleJWT-backed registration, login, session persistence in `localStorage`, and token refresh.
2. **Private Group Management**: Create private groups with group types (`friends`, `family`, `colleagues`, `other`), member rosters, and role separation (`owner`, `member`).
3. **Cryptographic Invitation Tokens**: Generate unique 32-byte secure invite links with expiration (7 days), active status tracking, preview endpoint, and duplicate join prevention.
4. **Personal Task & Shared Reward Engine**: Per-member task tracking using composite idempotency keys (`TASK_COMPLETED:<group_id>:<user_id>:TASK:<task_id>`).
5. **Idempotency & Double-Click Guard**: DB-level `unique_together` and `unique=True` constraints on `PointTransaction.idempotency_key` preventing double rewards on double clicks, multi-tab race conditions, or network retries.
6. **Per-User Benefit Claim System**: PostgreSQL row-level locking (`select_for_update`) and DB unique constraint (`unique_together = [('group', 'benefit', 'claimed_by')]`) ensuring every member can claim unlocked benefits for themselves without adding points to group total or blocking fellow members.
7. **Real-time Activity Stream**: Auditable activity log capturing `group_created`, `invite_created`, `participant_joined`, `profile_completed`, `task_completed`, and `benefit_claimed`.
8. **Responsive Glassmorphism UI**: Modern desktop, tablet, and mobile interface with loading spinners, skeleton states, error toasts, and progress indicators.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React 19 Frontend                   │
│   (Vite + TypeScript + Tailwind CSS v4 + Axios + Lucide)│
└────────────────────────────┬────────────────────────────┘
                             │ REST API / JWT
┌────────────────────────────▼────────────────────────────┐
│                    Django 6.1 Backend                   │
│   ┌─────────────────────────────────────────────────┐   │
│   │ Apps: Users | Groups | Rewards | Activities     │   │
│   ├─────────────────────────────────────────────────┤   │
│   │ Service Layer: create_group, award_points,      │   │
│   │ complete_task, claim_benefit, join_group        │   │
│   └─────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────┘
                             │ ORM / SQL Transactions
┌────────────────────────────▼────────────────────────────┐
│                  PostgreSQL 15 Database                 │
│   (Unique Constraints, Foreign Keys, select_for_update) │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Axios, Lucide React, Vitest.
- **Backend**: Django 6.1, Django REST Framework 3.18, djangorestframework-simplejwt, Pytest / Django Test Runner.
- **Database**: PostgreSQL 15 (Docker containerized) with atomic transaction blocks and row locking.
- **DevOps / Orchestration**: Docker Compose multi-container setup.

---

## Data Model

```
 ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
 │     User      │ 1      * │  GroupMember  │ *      1 │     Group     │
 ├───────────────┤──────────┼───────────────┼──────────┼───────────────┤
 │ id (UUID PK)  │          │ id (UUID PK)  │          │ id (UUID PK)  │
 │ email (UQ)    │          │ group_id (FK) │          │ name          │
 │ name          │          │ user_id (FK)  │          │ group_type    │
 │ phone         │          │ role          │          │ created_by(FK)│
 └───────────────┘          │ status        │          │ cached_points │
                            └───────┬───────┘          └───────┬───────┘
                                    │ 1                        │ 1
                                    │                          │
                                    │ *                        │ *
                            ┌───────▼───────────────┐          │
                            │   PointTransaction    │          │
                            ├───────────────────────┤          │
                            │ id (UUID PK)          │          │
                            │ group_id (FK) ────────┼──────────┘
                            │ member_id (FK)        │
                            │ action_type           │
                            │ reference_id          │
                            │ points                │
                            │ idempotency_key (UQ)  │
                            └───────────────────────┘
                                                       
 ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
 │  Invitation   │          │ BenefitClaim  │          │   Activity    │
 ├───────────────┤          ├───────────────┤          ├───────────────┤
 │ id (UUID PK)  │          │ id (UUID PK)  │          │ id (UUID PK)  │
 │ group_id (FK) │          │ group_id (FK) │          │ group_id (FK) │
 │ token (UQ)    │          │ benefit_id(FK)│          │ member_id(FK) │
 │ expires_at    │          │ claimed_by(FK)│          │ event_type    │
 └───────────────┘          └───────────────┘          │ metadata(JSON)│
                                                       └───────────────┘
```

---

## Business Rules

### Reward Model

Point allocations are defined by `RewardRule` database records and executed via the `award_points` service layer:

| Action Type | Trigger Event | Points | Recipient Scope |
| --- | --- | --- | --- |
| `GROUP_CREATED` | Owner creates group | +100 pts | Shared Group Points |
| `INVITE_CREATED` | Member generates unique invite | +25 pts | Shared Group Points |
| `PARTICIPANT_JOINED` | New user joins via invite link | +100 pts | Shared Group Points |
| `PROFILE_COMPLETED` | Member completes name/phone | +50 pts | Shared Group Points |
| `TASK_COMPLETED` | Member completes predefined task | +150 pts | Shared Group Points |

---

## Task Completion Model

**Explicit Definition**:
> **Task completion is personal, while points are shared at the group level.**

### Example Demonstration:

1. **User A** completes Task A ("Security Audit"):
   - Task A status for User A becomes `COMPLETED`.
   - `PointTransaction` created: `+150 pts` (Ref: `TASK_COMPLETED:Group1:UserA:TASK:Task1`).
   - Group Total Points increase by `+150`.
2. **User B** views dashboard:
   - Task A status for User B is still `AVAILABLE` (incomplete).
3. **User B** completes Task A ("Security Audit"):
   - Task A status for User B becomes `COMPLETED`.
   - `PointTransaction` created: `+150 pts` (Ref: `TASK_COMPLETED:Group1:UserB:TASK:Task1`).
   - Group Total Points increase by another `+150`.
4. **Group Result**:
   - Total Group Points earned from Task A: **+300 pts**.

---

## Idempotency

To prevent duplicate rewards caused by double-clicking buttons, network retries, browser refreshes, or multi-tab race conditions, the backend uses unique idempotency keys on `PointTransaction`:

| Action | Idempotency Key Format | DB Constraint | Duplicate Request Behavior |
| --- | --- | --- | --- |
| **Create Group** | `GROUP_CREATED:<group_id>` | `idempotency_key UNIQUE` | Returns existing group record safely |
| **Generate Invite** | Reuses active non-expired token | `token UNIQUE` | Returns existing active invitation token |
| **Join Group** | `PARTICIPANT_JOINED:<group_id>:<user_id>` | `GroupMember.unique_together` | Returns existing membership (`200 OK`) |
| **Complete Profile** | `PROFILE_COMPLETED:<group_id>:<user_id>:PROFILE` | `idempotency_key UNIQUE` | Returns `409 Conflict` ("Already completed") |
| **Complete Task** | `TASK_COMPLETED:<group_id>:<user_id>:TASK:<task_id>` | `idempotency_key UNIQUE` | Returns `409 Conflict` ("Already completed") |
| **Claim Benefit** | DB row lock on `Group` + `BenefitClaim` | `BenefitClaim.unique_together` | Returns existing claim record safely |

---

## Invitation Flow

1. **Token Generation**: Cryptographically safe random token (`secrets.token_urlsafe(32)`).
2. **Expiration**: Automatically set to `now() + 7 days`.
3. **Preview Endpoint**: `GET /api/invites/<token>/` allows unauthenticated users to view group name and member count before registering or logging in.
4. **Join Endpoint**: `POST /api/invites/<token>/join/` creates membership and awards +100 points atomically.

---

## Benefit Unlocking

Benefits exist in three distinct state transitions based on the group's `total_points`:

```
┌─────────────────┐
│     LOCKED      │ (group.total_points < benefit.required_points)
└────────┬────────┘
         │
         ▼ (group.total_points >= benefit.required_points)
┌─────────────────┐
│    AVAILABLE    │ (Unlocked for group; claim button active)
└────────┬────────┘
         │
         ▼ (Member clicks "Claim Benefit" -> select_for_update lock)
┌─────────────────┐
│     CLAIMED     │ (Permanently claimed; displays claiming user's name)
└─────────────────┘
```

---

## Activity Tracking

Every key event in a group records an auditable `Activity` log entry:
- `group_created`: Logged when group is initialized.
- `invite_created`: Logged when invite link is generated.
- `member_joined`: Logged when a new participant joins.
- `profile_completed`: Logged when a member fills out profile details.
- `task_completed`: Logged when a member completes a task.
- `benefit_claimed`: Logged when an unlocked benefit is claimed.

---

## Authentication & Authorization

- **JWT Authentication**: SimpleJWT access and refresh tokens.
- **Group Authorization (IDOR Protection)**: Every group endpoint (`/api/groups/<group_id>/*`) verifies active membership via `GroupMember.objects.filter(group=group, user=request.user, status='active')`. Non-members receive `403 Forbidden`.

---

## Edge Cases Handled

1. **Duplicate Registration**: Handled with clear `400 Bad Request` ("Email already registered").
2. **Expired / Invalid Invite**: Clean `410 Gone` or `404 Not Found` response with dedicated UI fallback page.
3. **Multi-Tab Race Condition**: Second request gets `409 Conflict` and triggers auto-resync of state.
4. **Concurrent Benefit Claiming**: Handled via `select_for_update()` PostgreSQL row locking.
5. **Slow Network Double-Clicking**: Submit buttons show loading state and disable immediately.

---

## Testing

### Running Tests

**Backend Test Suite**:
```bash
cd backend
source venv/bin/activate
python manage.py test backend/tests --noinput
```
*Executes 28 automated tests covering group creation, invitation lifecycle, collaborative reward logic, task idempotency, multi-threaded race conditions, profile completion, and IDOR authorization boundaries.*

**Frontend Test Suite**:
```bash
cd frontend
npm test
```
*Executes Vitest component and hook unit tests.*

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ & pnpm / npm
- PostgreSQL 15 (or Docker)

### Step 1: Clone Repository
```bash
git clone <repo-url>
cd Collaborative-Group-Rewards
```

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data  # Seeds default tasks and reward rules
python manage.py runserver
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)
```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=group_rewards
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Deployment

The application includes a production-ready `docker-compose.yml` for single-command containerized deployment:

```bash
docker-compose up --build -d
```

---

## Assumptions

| Area | Assumption | Reason | Impact |
| --- | --- | --- | --- |
| **Group-Level Points** | Points belong to the group, not individual wallets. | Encourages team collaboration toward joint rewards. | Individual user points are tracked for stats, but milestone unlocks depend on group sum. |
| **Per-User Task Completion** | Tasks can be completed once per member per group. | Maximizes group participation incentive. | User A and User B both get task rewards; duplicate attempts by same user are blocked. |
| **Invitation Token Expiry** | Invitations expire after 7 days. | Prevents stale invite security risks. | Expired links display a friendly renewal screen. |
| **Benefit Claims** | Any active member can claim an unlocked benefit for the group. | Simple collaborative ownership model. | First member to claim secures the reward for the team. |
| **Multiple Groups** | A user can create or join multiple groups. | Real-world usability requirement. | Top navigation provides a group switcher. |

---

## Known Limitations

1. **Real-time WebSockets**: Currently relies on polling/refetching on user actions rather than WebSockets or SSE.
2. **Invite Token Revocation UI**: Revocation logic exists in backend services, but full admin UI for token management is not exposed to standard users.
3. **Pagination**: Group activity streams are limited to the top 50 recent events; offset-based pagination is recommended for production scale (>10,000 events).

---

## Future Improvements

If granted one additional week of development, key focus areas would include:
1. **Real-time Synchronization (WebSockets/SSE)**: Instant cross-tab and cross-device live updates without manual page refreshes.
2. **E2E Integration Test Suite (Playwright)**: Full browser-level end-to-end automation testing across multi-user scenarios.
3. **Redis Caching & Distributed Locks**: High-performance caching layer for `group.total_points` and distributed Redlock locks for multi-node deployments.
4. **Enhanced Audit & Rate Limiting**: Fine-grained IP and user rate limiting on auth and invite routes (`django-ratelimit`).
