# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│   React 18 + TypeScript + Tailwind CSS + shadcn/ui          │
│   TanStack Query (server state) + Zustand (client state)    │
└───────────────────────────────┬─────────────────────────────┘
                                │ HTTPS / REST
┌───────────────────────────────▼─────────────────────────────┐
│                        API LAYER                             │
│   Express.js + TypeScript                                    │
│   JWT Auth · RBAC Middleware · Rate Limiting · Helmet        │
│   Swagger/OpenAPI 3.0 docs at /api/docs                     │
└───────────────────────────────┬─────────────────────────────┘
                                │ Prisma ORM
┌───────────────────────────────▼─────────────────────────────┐
│                       DATA LAYER                             │
│   PostgreSQL 16 (primary)                                    │
│   Redis 7 (session cache, rate limiting)                     │
└─────────────────────────────────────────────────────────────┘
```

## Module Structure (Backend)

```
src/
├── modules/           # Feature modules (route, controller, service, types)
│   ├── auth/          # Login, refresh, password management
│   ├── students/      # Student CRUD, bulk import
│   ├── teachers/      # Teacher management
│   ├── classes/       # Class management
│   ├── attendance/    # Single + bulk attendance marking
│   ├── holidays/      # Holiday calendar management
│   ├── dashboard/     # Aggregated statistics
│   ├── reports/       # PDF/Excel generation
│   └── notifications/ # In-app notifications
├── services/          # Cross-cutting services
│   └── attendanceCalculation.service.ts  # Core business logic
├── middleware/        # Auth, RBAC, error handling, rate limiting
├── config/            # Database, JWT, logger, Swagger, constants
└── utils/             # Date helpers, formatters, email, PDF
```

## Authentication Flow

```
Client → POST /auth/login
       ← accessToken (15min, Bearer header)
       ← refreshToken (7d, httpOnly cookie)

Client → API request with Authorization: Bearer <accessToken>
       ← 401 if expired

Client → POST /auth/refresh (cookie sent automatically)
       ← new accessToken
```

## RBAC Matrix

| Resource           | SUPER_ADMIN | ADMIN | TEACHER | PARENT | VIEWER |
|--------------------|-------------|-------|---------|--------|--------|
| Students (write)   | ✅          | ✅    | ❌      | ❌     | ❌     |
| Students (read)    | ✅          | ✅    | ✅      | own    | ✅     |
| Attendance (write) | ✅          | ✅    | ✅      | ❌     | ❌     |
| Attendance (read)  | ✅          | ✅    | ✅      | own    | ✅     |
| Dashboard          | ✅          | ✅    | ✅      | ❌     | ✅     |
| Reports            | ✅          | ✅    | ✅      | own    | ✅     |
| Holidays (write)   | ✅          | ✅    | ❌      | ❌     | ❌     |
| Settings           | ✅          | ✅    | ❌      | ❌     | ❌     |

## Attendance Calculation Engine

```
Working Days = School days EXCLUDING:
  - Weekends (configurable per school)
  - Public holidays
  - School breaks
  - Days before student enrollment date

Attendance % = (Present + 0.75×Late + 0.5×HalfDay) / Working Days × 100

Late Rules:
  ≤15 min late  → counted as PRESENT
  16–60 min     → counted as LATE (0.75 weight)
  >60 min late  → counted as ABSENT

Tier:  ≥90% = EXCELLENT | 75–89% = GOOD | 60–74% = WARNING | <60% = AT_RISK

Alerts:
  3 consecutive absences → notify parent
  5 consecutive absences → escalate to admin
```

## Key Design Decisions

1. **Multi-tenancy**: Every query is scoped to `schoolId`. SUPER_ADMIN bypasses this.
2. **Soft deletes**: Students and teachers use `isActive: false`, preserving historical attendance data.
3. **Token versioning**: Incrementing `tokenVersion` on logout/password-change invalidates all refresh tokens.
4. **Async alerts**: Consecutive-absence checks run via `setImmediate` to avoid blocking the attendance POST response.
5. **Upsert attendance**: Bulk mark uses `upsert` on `[studentId, date]` unique key — safe to re-submit.
