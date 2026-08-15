# Business Rules & Idempotency Specs

## Core Collaborative Reward Model

> **Primary Rule**: Task completion is **PERSONAL**, reward accumulation is **SHARED AT THE GROUP LEVEL**, and benefit claiming is **PER-USER** (unlocked for all members when group total reaches threshold; redemptions do not add points to group total).

```
                GROUP
                  │
        ┌─────────┴─────────┐
        │                   │
      Ajay                Sanjay
        │                   │
   Task 1 complete      Task 1 complete
        │                   │
      +150                +150
        │                   │
        └─────────┬─────────┘
                  ↓
           GROUP = 300
                  ↓
          Benefit Threshold (e.g. 200 pts)
        ┌─────────┴─────────┐
        │                   │
  Ajay Claims         Sanjay Claims
(Claimed for Ajay)  (Claimed for Sanjay)
```

---

## Reward Allocations

Point allocations are defined by `RewardRule` records and processed via the service layer:

- **Create Group**: +100 points
- **Generate Invite**: +25 points
- **Participant Joins**: +100 points
- **Complete Profile**: +50 points
- **Complete Task**: +150 points

*(Note: Claiming benefits is a milestone reward redemption and does not add points to the group total)*

---

## Idempotency Matrix

| Action | Idempotency Key Format | DB Enforcement | Outcome on Duplicate Request |
| --- | --- | --- | --- |
| **Create Group** | `GROUP_CREATED:<group_id>` | `idempotency_key UNIQUE` | Returns existing group record |
| **Generate Invite** | Reuses active non-expired token | `token UNIQUE` | Returns active invite token (`200 OK`) |
| **Join Group** | `PARTICIPANT_JOINED:<group_id>:<user_id>` | `GroupMember.unique_together` | Returns existing membership (`200 OK`) |
| **Complete Profile** | `PROFILE_COMPLETED:<group_id>:<user_id>:PROFILE` | `idempotency_key UNIQUE` | Returns `409 Conflict` |
| **Complete Task** | `TASK_COMPLETED:<group_id>:<user_id>:TASK:<task_id>` | `idempotency_key UNIQUE` | Returns `409 Conflict` |
| **Claim Benefit** | PostgreSQL Row Lock | `BenefitClaim.unique_together = [('group', 'benefit', 'claimed_by')]` | Returns existing claim record for user |
