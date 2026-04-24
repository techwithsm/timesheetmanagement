# School Timesheet & Attendance Management System

A full-stack web application that automates student attendance tracking, reporting, and notifications for schools. Built for administrators, teachers, and parents to collaboratively manage attendance with real-time dashboards, automated alerts, and exportable reports.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Key Benefits](#key-benefits)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Features & Modules](#features--modules)
- [User Roles & Access Control](#user-roles--access-control)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Option 1: Local Development](#option-1-local-development)
  - [Option 2: Docker (Recommended)](#option-2-docker-recommended)
- [Environment Variables](#environment-variables)
- [Default Seed Credentials](#default-seed-credentials)
- [Considerations for Schools](#considerations-for-schools)
- [Security](#security)

---

## About the Project

The **School Timesheet & Attendance Management System** replaces paper-based and spreadsheet attendance registers with a centralised, role-based web platform. It is designed for K–12 schools that need:

- A single source of truth for daily student attendance
- Automated parent and admin alerts when students are absent
- Visual dashboards with attendance trends and at-risk student detection
- Exportable PDF and Excel reports for compliance and parent communication
- A configurable holiday calendar that affects attendance calculation

The system supports **multi-school deployment** — each school operates within its own data boundary, managed by a Super Admin.

---

## Key Benefits

| Benefit | Description |
|---|---|
| **Time Saving** | Teachers mark attendance digitally in seconds; no paper registers or manual data entry |
| **Accuracy** | Weighted attendance formula (Late = 0.75, Half-Day = 0.5) gives a fair picture of each student's attendance |
| **Early Intervention** | Dashboard flags students below 80% attendance so staff can act before it becomes a problem |
| **Parent Transparency** | Parents receive automatic email alerts on absence and can log in to view attendance history |
| **Audit Trail** | Every change is logged — who marked what, when, and from which IP |
| **Compliance Ready** | Monthly PDF and Excel reports can be shared with inspectors or governing bodies |
| **Holiday Aware** | Attendance % is calculated only against actual working days, excluding weekends, public holidays, and school breaks |
| **Scalable** | Docker-based deployment runs on any cloud provider; add more schools without code changes |
| **Secure** | JWT authentication, rate limiting, account lockout, bcrypt password hashing, and RBAC out of the box |
| **API First** | Full Swagger/OpenAPI documentation — integrations with other school systems are straightforward |

---

## Technologies Used

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework with full type safety |
| Vite 5 | Fast development server and optimised production builds |
| Tailwind CSS 3.4 | Utility-first styling |
| shadcn/ui | Accessible UI component library |
| Zustand | Lightweight client-side state management |
| TanStack Query v5 | Server state, caching, and background refresh |
| React Router DOM 6 | Client-side routing with protected routes |
| React Hook Form + Zod | Form handling and schema-based validation |
| Axios | HTTP client for API calls |
| Recharts 2 | Attendance trend charts and visual dashboards |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| Node.js 20 + Express 4 | API server runtime and framework |
| TypeScript 5 | Type-safe server-side code |
| Prisma 5.7 | ORM and database migration tool |
| PostgreSQL 16 | Primary relational database |
| Redis 7 | Session caching and rate limit counters |
| JSON Web Tokens (JWT) | Stateless authentication (15-min access + 7-day refresh) |
| Bcrypt | Password hashing |
| Nodemailer 6.9 | Transactional email (absence alerts, password reset) |
| ExcelJS 4 | Excel report generation |
| PDFKit | PDF report generation |
| Winston 3 | Structured application logging |
| Helmet + CORS | HTTP security headers and cross-origin control |
| express-rate-limit | API rate limiting |
| Swagger / OpenAPI 3.0 | Auto-generated interactive API documentation |
| Jest + Supertest | Unit and integration testing |
| Zod | Runtime schema validation |

### DevOps & Infrastructure

| Technology | Purpose |
|---|---|
| Docker | Containerised, reproducible builds |
| Docker Compose | Multi-service orchestration (DB + Redis + API + Frontend) |
| Nginx (Alpine) | Frontend SPA server and API reverse proxy with gzip compression |
| Docker Volumes | Persistent storage for PostgreSQL and Redis data |

---

## Project Structure

```
TimesheetManagement/
│
├── backend/                          # Node.js / Express API server
│   ├── src/
│   │   ├── modules/                  # Feature modules (each owns its own router, service, types, validators)
│   │   │   ├── auth/                 # Login, logout, refresh, password reset
│   │   │   ├── students/             # Student CRUD, bulk CSV import
│   │   │   ├── teachers/             # Teacher profiles and class assignments
│   │   │   ├── classes/              # Class management and student rosters
│   │   │   ├── attendance/           # Mark, bulk-mark, update attendance records
│   │   │   ├── holidays/             # Holiday calendar and working-day calculator
│   │   │   ├── dashboard/            # KPI aggregation and trend data
│   │   │   ├── reports/              # PDF and Excel report generation
│   │   │   └── notifications/        # In-app alerts and notification management
│   │   ├── config/
│   │   │   ├── database.ts           # Prisma client setup
│   │   │   ├── jwt.ts                # Token generation and verification
│   │   │   ├── logger.ts             # Winston logging configuration
│   │   │   ├── swagger.ts            # OpenAPI spec generation
│   │   │   └── constants.ts          # Global enums (roles, statuses, thresholds)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verification
│   │   │   ├── rbac.middleware.ts     # Role-based access control
│   │   │   ├── errorHandler.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   ├── auditLog.middleware.ts # Logs every data-changing request
│   │   │   └── validation.middleware.ts
│   │   ├── services/
│   │   │   └── attendanceCalculation.service.ts  # Core attendance % engine
│   │   ├── utils/
│   │   │   ├── dateUtils.ts          # Working-day calculation logic
│   │   │   ├── emailSender.util.ts   # Email template builder and sender
│   │   │   ├── pagination.util.ts
│   │   │   └── response.util.ts
│   │   ├── app.ts                    # Express app setup (middleware, routes)
│   │   └── server.ts                 # HTTP server entry point
│   ├── prisma/
│   │   ├── schema.prisma             # Complete database schema
│   │   ├── seed.ts                   # Sample data (school, classes, students, teachers)
│   │   └── migrations/               # Auto-generated SQL migration history
│   ├── tests/
│   │   ├── unit/                     # Unit tests (attendance calculation logic)
│   │   └── integration/              # Integration tests (auth flows)
│   ├── Dockerfile                    # Multi-stage builder → runtime image
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # React + Vite single-page application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # KPI overview and charts
│   │   │   ├── Login.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Students.tsx          # Student list, StudentForm, StudentDetail
│   │   │   ├── Teachers.tsx
│   │   │   ├── Classes.tsx
│   │   │   ├── Holidays.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── attendance/
│   │   │       ├── Attendance.tsx
│   │   │       ├── MarkAttendance.tsx
│   │   │       └── AttendanceHistory.tsx
│   │   ├── components/
│   │   │   ├── common/               # DataTable, LoadingSpinner, ProtectedRoute
│   │   │   ├── layout/               # Header, Sidebar, Layout wrapper
│   │   │   ├── attendance/           # AttendanceCalendar, AttendanceGrid, BulkMarkForm
│   │   │   ├── dashboard/            # StatCard, AttendanceTrendChart, AtRiskStudentsTable
│   │   │   ├── notifications/        # NotificationBell
│   │   │   └── students/             # StudentCard, AttendanceCalendarHeatmap
│   │   ├── services/                 # Axios-based API client wrappers
│   │   ├── store/                    # Zustand stores (auth, notifications, theme)
│   │   ├── hooks/                    # Custom React hooks (useAttendance, useStudents, etc.)
│   │   ├── types/                    # Shared TypeScript types
│   │   └── utils/                    # Constants and formatters
│   ├── Dockerfile                    # Multi-stage builder → Nginx image
│   ├── nginx.conf                    # SPA routing and API proxy
│   ├── vite.config.ts
│   └── package.json
│
├── docker-compose.yml                # Orchestrates all 4 services
├── docs/
│   ├── API.md                        # Full API endpoint reference
│   └── ARCHITECTURE.md              # System design and RBAC matrix
├── scripts/
│   ├── setup.sh                      # First-time project setup (Unix)
│   └── backup.sh                     # PostgreSQL backup script
├── templates/
│   ├── email/                        # HTML email templates (absence alert, password reset, weekly report)
│   └── reports/                      # HTML report layout templates
├── start.bat                         # Windows one-click development startup
├── .env.example                      # Root environment variable template
└── .gitignore
```

---

## Features & Modules

### Authentication
- Email/password login with JWT access tokens (15 min) and refresh tokens (7-day httpOnly cookie)
- Automatic token refresh without re-login
- Password reset via time-limited email link
- Account lockout after 5 failed login attempts (30-minute cooldown)
- Full audit log of all login attempts

### Student Management
- Create, update, and soft-delete student records (preserves historical attendance)
- Bulk import students from CSV
- Fields: name, date of birth, gender, blood group, emergency contact, medical notes, photo
- Class assignment and parent/guardian linking

### Teacher Management
- Teacher profiles with employee ID, department, qualification, and joining date
- Class assignment and staff directory

### Class Management
- Configure grade, section, room number, and capacity
- Assign a head teacher to each class
- View student roster per class

### Attendance Marking
- Mark individual or bulk attendance: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`, `HALF_DAY`
- Late arrival tracking with configurable thresholds (≤15 min = PRESENT, 16–60 min = LATE, >60 min = ABSENT)
- Upsert-safe — re-submitting the same record updates rather than duplicates
- Filter attendance history by student, class, and date range

### Attendance Calculation Engine
The core formula applied to every student:

```
Attendance % = (Present + 0.75 × Late + 0.5 × HalfDay) / Working Days × 100
```

Working days exclude weekends, public holidays, school breaks, and days before the student's enrolment date.

Attendance tiers:
- **Excellent** — 90% and above
- **Good** — 75% to 89%
- **Warning** — 60% to 74%
- **At Risk** — Below 60%

### Holiday Management
- Add public holidays, school breaks (summer, winter, spring, exam periods)
- Multi-day and recurring holiday support
- Working-days calculator endpoint for any date range

### Dashboard
- Total student and teacher count
- Today's attendance count across all classes
- 6-month attendance trend chart
- At-risk students list (configurable threshold, default 80%)
- Per-class daily attendance summary

### Reports
- **PDF** — Individual student monthly attendance report
- **Excel** — Full class attendance register with row totals and summary row

### Notifications
- In-app notification bell with unread badge count
- Automated email alerts:
  - 3 consecutive absences → email to parent
  - 5 consecutive absences → email to school admin
  - Password reset confirmation
- Notification types: Absence Alert, At-Risk, Attendance Reminder, Enrolment, Holiday Update, System

---

## User Roles & Access Control

| Role | Description |
|---|---|
| **SUPER_ADMIN** | System-level access across all schools; manages school onboarding and global settings |
| **ADMIN** | School administrator; manages staff, students, holidays, and school configuration |
| **TEACHER** | Marks attendance, views class and student data, generates reports |
| **PARENT** | Views own child's attendance history and receives absence alerts |
| **VIEWER** | Read-only access to dashboards and reports |

| Resource | SUPER_ADMIN | ADMIN | TEACHER | PARENT | VIEWER |
|---|:-:|:-:|:-:|:-:|:-:|
| Students (write) | Yes | Yes | No | No | No |
| Students (read) | Yes | Yes | Yes | Own child | Yes |
| Attendance (write) | Yes | Yes | Yes | No | No |
| Attendance (read) | Yes | Yes | Yes | Own child | Yes |
| Dashboard | Yes | Yes | Yes | No | Yes |
| Reports | Yes | Yes | Yes | Own child | Yes |
| Holidays (write) | Yes | Yes | No | No | No |
| School Settings | Yes | Yes | No | No | No |

---

## Database Schema

The system uses PostgreSQL with Prisma ORM. Key models:

| Model | Description |
|---|---|
| **School** | Multi-tenant root — name, address, timezone, academic year dates, working days, late threshold |
| **User** | Authentication and RBAC — email, password hash, role, account lockout fields, token version |
| **Teacher** | Staff profiles — employee ID, department, qualification, joining date |
| **Class** | Classroom entity — grade, section, academic year, room number, capacity, assigned teacher |
| **Student** | Learner profiles — student ID, personal details, enrolment date, class, parent link |
| **Attendance** | Daily record — student, class, date, status, late minutes, check-in/out times, marker |
| **Holiday** | School calendar — name, date range, type (public/school/break), recurring flag |
| **AcademicTerm** | Term configuration — name, start/end dates, active flag |
| **Notification** | In-app alerts — user, title, message, type, read status |
| **AuditLog** | Change log — user, action, entity, old/new values, IP address |
| **LoginAuditLog** | Login history — user, success flag, IP, user agent |

---

## API Reference

**Base URL:** `http://localhost:3001/api/v1`  
**Interactive Docs:** `http://localhost:3001/api/docs` (Swagger UI — available once the server is running)

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/login` | Login → returns accessToken | No |
| POST | `/auth/logout` | Logout, invalidates refresh token | Yes |
| POST | `/auth/refresh` | Get new accessToken using cookie | No |
| POST | `/auth/forgot-password` | Send password reset email | No |
| POST | `/auth/reset-password` | Reset password with email token | No |
| PUT | `/auth/change-password` | Change own password | Yes |
| GET | `/auth/me` | Current user profile | Yes |

### Students
| Method | Endpoint | Description |
|---|---|---|
| GET | `/students` | Paginated list with search and filters |
| POST | `/students` | Create student (Admin) |
| GET | `/students/:id` | Student detail |
| PUT | `/students/:id` | Update student (Admin) |
| DELETE | `/students/:id` | Soft-delete (Admin) |
| GET | `/students/:id/attendance` | Attendance history |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/attendance` | List records with filters |
| POST | `/attendance` | Mark single record |
| POST | `/attendance/bulk` | Bulk mark array of records |
| PUT | `/attendance/:id` | Update a record |
| DELETE | `/attendance/:id` | Delete (Admin) |
| GET | `/attendance/summary` | Monthly class summary |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/overview` | KPI cards |
| GET | `/dashboard/attendance-trend` | 6-month trend data |
| GET | `/dashboard/at-risk-students` | Students below threshold |
| GET | `/dashboard/class-summary` | Today's per-class summary |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/student/:id` | PDF student report (month param) |
| GET | `/reports/class/:id` | Excel class register (month param) |

All list endpoints return paginated responses:
```json
{
  "data": [...],
  "pagination": {
    "page": 1, "limit": 20, "total": 150,
    "totalPages": 8, "hasNext": true, "hasPrev": false
  }
}
```

---

## Getting Started

### Prerequisites

**For local development:**
- Node.js 20 or higher
- PostgreSQL 16
- Redis 7
- npm 9+

**For Docker deployment:**
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2

---

### Option 1: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/techwithsm/timesheetmanagement.git
cd timesheetmanagement

# 2. Install backend dependencies and configure environment
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT secrets, and SMTP settings

# 3. Run database migrations and seed sample data
npx prisma migrate dev --name init
npx prisma db seed

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Start both servers
# Terminal 1 — API server (port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend dev server (port 3000)
cd frontend && npm run dev
```

**Windows shortcut:** run `start.bat` from the project root — it opens both terminals automatically.

**Access:**
- Frontend: `http://localhost:3000`
- API: `http://localhost:3001/api/v1`
- Swagger Docs: `http://localhost:3001/api/docs`

---

### Option 2: Docker (Recommended)

This spins up all four services (PostgreSQL, Redis, API, Frontend) with a single command.

```bash
# 1. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — set strong JWT secrets and SMTP credentials

# 2. Build and start all services
docker-compose up --build

# 3. On first run, run migrations inside the container
docker exec school_backend npx prisma migrate deploy
docker exec school_backend npx prisma db seed
```

**Services started:**

| Service | Port | Description |
|---|---|---|
| school_frontend | 3000 | React SPA via Nginx |
| school_backend | 3001 | Express API |
| school_postgres | 5432 | PostgreSQL 16 |
| school_redis | 6379 | Redis 7 |

Data is persisted in Docker volumes (`postgres_data`, `redis_data`) and survives container restarts.

**Stop all services:**
```bash
docker-compose down
```

**Database backup:**
```bash
./scripts/backup.sh
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=3001

# PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_timesheet"

# JWT — use long random strings (32+ characters)
JWT_ACCESS_SECRET=replace_with_strong_random_string
JWT_REFRESH_SECRET=replace_with_different_strong_random_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Email (use Mailtrap for development, real SMTP for production)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password
SMTP_FROM=noreply@yourschool.edu

# CORS
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=/api/v1
```

---

## Considerations for Schools

Before deploying this system, schools should address the following:

### 1. Infrastructure
- A server or cloud instance to host the application (AWS, Azure, Google Cloud, DigitalOcean, or on-premises)
- At minimum: 2 vCPUs, 4 GB RAM, 20 GB storage for a school of up to 1,000 students
- A domain name and HTTPS certificate (e.g., via Let's Encrypt / Cloudflare)

### 2. Email Provider
The system sends automated emails for absence alerts and password resets. Choose a reliable transactional email provider:
- **Mailtrap** — Free, for testing only (emails never reach real inboxes)
- **SendGrid** — Free tier: 100 emails/day (suitable for small schools)
- **Mailgun** — Pay-as-you-go, reliable deliverability
- **AWS SES** — Very low cost, ideal if already on AWS
- **Gmail SMTP** — Works, but requires an App Password and has send limits

Configure the chosen provider's SMTP settings in `backend/.env`.

### 3. Data Privacy & Compliance
- This system stores personal data (student names, dates of birth, parent contact details)
- Ensure compliance with your regional data protection law: **GDPR** (UK/EU), **FERPA** (USA), **PDPA** (India/Thailand), or equivalent
- Define a data retention policy for attendance records and audit logs
- Inform parents via a privacy notice that their data is stored digitally

### 4. Initial Data Setup
Before going live, administrators should:
1. Create the school profile (name, timezone, academic year dates, working days)
2. Add all classes for the current academic year
3. Register all teachers and link them to classes
4. Import all students (bulk CSV upload available)
5. Link parent accounts to student records
6. Configure the holiday calendar for the academic year

### 5. Staff Training
- **Admins** need to understand user management, class configuration, and report generation
- **Teachers** need to know how to mark individual and bulk attendance daily
- **Parents** should be guided through the login process and notification settings

### 6. Backups
- Schedule regular automated backups of the PostgreSQL database using `scripts/backup.sh`
- Store backups off-server (S3 bucket, Google Drive, external drive)
- Test a restore at least once before going live

### 7. Security Hardening for Production
- Replace all default passwords in `.env` and `docker-compose.yml`
- Generate strong, unique JWT secrets (minimum 32 characters, random)
- Enable HTTPS — do not run the application over plain HTTP in production
- Restrict database access — PostgreSQL should not be publicly exposed
- Review the rate limiting configuration for your school's user volume

### 8. Customisation
Schools may wish to customise:
- The attendance threshold for at-risk alerts (default: 80%)
- Late arrival thresholds (default: 15 min = present, 16–60 min = late, >60 min = absent)
- Working days per week (configurable per school)
- Email templates (`templates/email/`) — add school logo and branding
- Report layouts (`templates/reports/`) — add school header and address

---

## Security

The system includes the following security controls out of the box:

| Control | Implementation |
|---|---|
| Password hashing | Bcrypt with configurable rounds (default 12) |
| Authentication | JWT access tokens (15 min) + refresh tokens (7-day httpOnly cookie) |
| Account lockout | 5 failed attempts triggers 30-minute lockout |
| Token invalidation | Token version incremented on logout and password change |
| Role-based access | RBAC middleware enforced on every protected route |
| Rate limiting | Per-IP request throttling via express-rate-limit |
| HTTP headers | Helmet.js sets security headers (CSP, HSTS, X-Frame-Options, etc.) |
| CORS | Restricted to configured `FRONTEND_URL` only |
| Input validation | Zod schemas validate all request bodies before processing |
| SQL injection | Prevented by Prisma ORM — no raw string queries |
| Audit logging | Every data-changing request is logged with user, IP, and before/after values |
| Login audit | All login attempts (success and failure) recorded separately |

---

## Running Tests

```bash
# Backend — all tests
cd backend && npm test

# Backend — unit tests only
npm run test:unit

# Backend — integration tests only
npm run test:integration

# Frontend — linting
cd frontend && npm run lint
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: description of change"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.
