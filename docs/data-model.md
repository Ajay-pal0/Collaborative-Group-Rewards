# Data Model Documentation

## Entity Relationship Diagram (ERD)

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

## Detailed Model Definitions

### 1. `User` Model
- **Table**: `users`
- **Fields**: `id` (UUID), `email` (Unique string), `name` (string), `phone` (string), `is_active` (boolean), `created_at` (datetime).

### 2. `Group` Model
- **Table**: `groups`
- **Fields**: `id` (UUID), `name` (string), `group_type` (`friends`/`family`/`colleagues`/`other`), `created_by` (FK -> User), `cached_total_points` (integer, default 0).

### 3. `GroupMember` Model
- **Table**: `group_members`
- **Fields**: `id` (UUID), `group` (FK -> Group), `user` (FK -> User), `role` (`owner`/`member`), `status` (`active`/`left`), `joined_at` (datetime).
- **Constraints**: `unique_together = [('group', 'user')]`.

### 4. `PointTransaction` Model
- **Table**: `point_transactions`
- **Fields**: `id` (UUID), `group` (FK -> Group), `member` (FK -> GroupMember), `action_type` (string), `reference_id` (string), `points` (integer), `idempotency_key` (Unique string).
- **Indexes**: Index on `(group, action_type)` and Unique Index on `idempotency_key`.

### 5. `Benefit` & `BenefitClaim` Models
- **Table**: `benefits` / `benefit_claims`
- **Fields**: `required_points` (integer), `group` (FK -> Group), `benefit` (FK -> Benefit), `claimed_by` (FK -> User).
- **Constraints**: `unique_together = [('group', 'benefit', 'claimed_by')]`.
