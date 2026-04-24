# API Reference

Base URL: `http://localhost:3001/api/v1`

Interactive docs: `http://localhost:3001/api/docs` (Swagger UI)

## Authentication

All endpoints except `POST /auth/login` require a Bearer token:
```
Authorization: Bearer <accessToken>
```

Refresh tokens are sent as an `httpOnly` cookie named `refreshToken`.

---

## Auth

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | `/auth/login` | — | Login, returns accessToken + sets refreshToken cookie |
| POST | `/auth/logout` | Any | Invalidates refresh token |
| POST | `/auth/refresh` | — | Returns new accessToken using cookie |
| POST | `/auth/forgot-password` | — | Sends password reset email |
| POST | `/auth/reset-password` | — | Resets password via token |
| PUT | `/auth/change-password` | Any | Change own password |
| GET | `/auth/me` | Any | Get current user profile |

### Login request
```json
{ "email": "admin@greenfield.edu", "password": "Admin@1234" }
```

### Login response
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "ADMIN", ... },
    "accessToken": "eyJ..."
  }
}
```

---

## Students

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/students` | ADMIN, TEACHER, VIEWER | List students (paginated) |
| POST | `/students` | ADMIN | Create student |
| GET | `/students/:id` | ADMIN, TEACHER, PARENT | Get student details |
| PUT | `/students/:id` | ADMIN | Update student |
| DELETE | `/students/:id` | ADMIN | Soft-delete student |
| GET | `/students/:id/attendance` | ADMIN, TEACHER, PARENT | Student attendance history |

### Query params for GET /students
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` — searches firstName, lastName, studentId
- `classId` — filter by class
- `isActive` — `true` or `false`
- `gender` — `MALE`, `FEMALE`, `OTHER`

---

## Teachers

| Method | Path | Roles |
|--------|------|-------|
| GET | `/teachers` | ADMIN, TEACHER, VIEWER |
| POST | `/teachers` | ADMIN |
| GET | `/teachers/:id` | ADMIN, TEACHER |
| PUT | `/teachers/:id` | ADMIN |
| DELETE | `/teachers/:id` | ADMIN |
| GET | `/teachers/:id/classes` | ADMIN, TEACHER |

---

## Classes

| Method | Path | Roles |
|--------|------|-------|
| GET | `/classes` | ADMIN, TEACHER, VIEWER |
| POST | `/classes` | ADMIN |
| GET | `/classes/:id` | ADMIN, TEACHER, VIEWER |
| PUT | `/classes/:id` | ADMIN |
| DELETE | `/classes/:id` | ADMIN |
| GET | `/classes/:id/students` | ADMIN, TEACHER |
| GET | `/classes/:id/attendance?date=YYYY-MM-DD` | ADMIN, TEACHER |

---

## Attendance

| Method | Path | Roles |
|--------|------|-------|
| GET | `/attendance` | ADMIN, TEACHER, VIEWER |
| POST | `/attendance` | ADMIN, TEACHER |
| POST | `/attendance/bulk` | ADMIN, TEACHER |
| PUT | `/attendance/:id` | ADMIN, TEACHER |
| DELETE | `/attendance/:id` | ADMIN |
| GET | `/attendance/summary?classId=&month=YYYY-MM` | ADMIN, TEACHER, VIEWER |

### Attendance status values
`PRESENT` | `ABSENT` | `LATE` | `EXCUSED` | `HALF_DAY`

### Bulk mark request
```json
{
  "classId": "cls_id",
  "date": "2025-10-01",
  "records": [
    { "studentId": "stu_id", "status": "PRESENT", "lateMinutes": 0 },
    { "studentId": "stu_id2", "status": "ABSENT", "note": "Sick" }
  ]
}
```

---

## Holidays

| Method | Path | Roles |
|--------|------|-------|
| GET | `/holidays?year=2025&type=PUBLIC` | ADMIN, TEACHER, VIEWER |
| POST | `/holidays` | ADMIN |
| PUT | `/holidays/:id` | ADMIN |
| DELETE | `/holidays/:id` | ADMIN |
| GET | `/holidays/working-days?startDate=&endDate=` | ADMIN, TEACHER |

---

## Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard/overview` | Summary cards (students, teachers, today's attendance) |
| GET | `/dashboard/attendance-trend?classId=&months=6` | Monthly trend data |
| GET | `/dashboard/at-risk-students?threshold=80&classId=` | Students below threshold |
| GET | `/dashboard/class-summary` | Per-class today's summary |

---

## Reports

| Method | Path | Description |
|--------|------|-------------|
| GET | `/reports/student/:id?month=YYYY-MM` | Download PDF attendance report |
| GET | `/reports/class/:id?month=YYYY-MM` | Download Excel class register |

---

## Notifications

| Method | Path |
|--------|------|
| GET | `/notifications` |
| PUT | `/notifications/:id/read` |
| PUT | `/notifications/read-all` |

---

## Pagination

All list endpoints return:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 80,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error responses

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "Valid email required" }] }
```

HTTP status codes: `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `429` Too Many Requests · `500` Internal Error
