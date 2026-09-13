# Corporate Room Booking System — Project Requirements & Architecture

## 1. Project Overview

The Corporate Room Booking System is a multi-company web application for managing companies, departments, employees, meeting rooms, room availability, bookings, participants, notifications, policies, and audit history.

The system will be implemented as a **modular monolith** for V1, with React and Spring Boot maintained as separate applications in one Git repository.

### Technology Stack

- Frontend: React + Vite
- Backend: Spring Boot
- Database: MySQL
- Authentication/Authorization: Spring Security + JWT
- Database migrations: Flyway
- Email: SMTP / Email provider
- AI: Out of scope for V1; architecture should allow Spring AI later

---

## 2. User Roles

### 2.1 Super Admin

Application-level administrator.

Responsibilities:

- Create, view, update, and deactivate/delete companies
- Create and manage company administrators
- Activate/deactivate companies and administrators
- View companies

### 2.2 Company Admin

Belongs to one company.

Responsibilities:

- Create, update, and deactivate/delete departments
- Create, update, and deactivate/delete employees
- Create, update, and deactivate/delete rooms
- Configure company booking policies
- View company bookings/calendar
- Manage company-level room information

A Company Admin must only be able to access data belonging to their own company.

### 2.3 Employee

Belongs to one company and department.

Responsibilities:

- Search/view room availability
- Book available rooms
- Book rooms for future dates
- Add meeting participants
- View own upcoming and past bookings
- Update own scheduled bookings
- Cancel own scheduled bookings

---

# 3. Functional Requirements

## 3.1 Company Management

Super Admin can:

- Create company
- View company
- Update company
- Activate/deactivate company
- Delete company where permitted
- Create and manage company administrators

Suggested fields:

```text
id
name
company_code
contact_information
address
status
created_at
updated_at
```

---

## 3.2 Department Management

Company Admin can:

- Create department
- Update department
- Deactivate/delete department
- View departments
- Search/filter departments

Each department belongs to exactly one company.

---

## 3.3 Employee Management

Company Admin can:

- Create employee
- Update employee
- Deactivate employee
- View employees
- Assign employee to department
- Move employee between departments
- Search/filter employees

Each employee belongs to one company and one department.

---

## 3.4 Room Management

Company Admin can:

- Create room
- Update room
- Deactivate room
- View rooms
- Configure room capacity
- Configure room location/floor
- Mark room as available or under maintenance

Suggested fields:

```text
id
company_id
name
location
floor
capacity
description
status
created_at
updated_at
```

Possible room statuses:

```text
AVAILABLE
MAINTENANCE
INACTIVE
```

---

# 4. Room Booking

Employees and authorized administrators can book rooms.

A booking contains:

- Room
- Meeting title
- Description
- Start date/time
- End date/time
- Booker
- Participants
- Booking status
- Created timestamp
- Updated timestamp

Future-date booking is a core requirement.

### Example

```text
Date:          18 September 2026
Time:          10:00 AM - 11:30 AM
Room:          Conference Room A
Title:         Project Discussion
Participants:  8
```

---

# 5. Booking Policies

Company Admin should be able to configure policies such as:

```text
Maximum advance booking: 30 days
Minimum booking duration: 30 minutes
Maximum booking duration: 4 hours
Cancellation cutoff: 30 minutes before start
```

These values must be configurable and should not be hard-coded.

---

# 6. Availability Checking

The system must check whether a room is available for the requested date/time.

An existing booking overlaps a requested booking when:

```text
existing.start_time < requested.end_time
AND
existing.end_time > requested.start_time
```

The availability check must consider only active/conflicting bookings.

---

# 7. Double-Booking Prevention

The backend must guarantee that two confirmed bookings cannot overlap for the same room.

React-side validation is not sufficient.

Booking creation/update must use suitable transaction and concurrency-control mechanisms so simultaneous requests cannot create conflicting bookings.

The database should also have appropriate indexes/constraints where applicable.

---

# 8. Nearest Available Slot

If the requested room/time is unavailable, the system should suggest alternatives.

Priority:

1. Alternative room at the same time
2. Nearest available time on the same date
3. Nearest available future date/time

The requested duration must be preserved.

### Example

Requested:

```text
18 Sep 2026
10:00 - 11:00
```

If unavailable:

```text
10:00 - 11:00  Meeting Room B
11:00 - 12:00  Conference Room A
02:00 - 03:00  Board Room
19 Sep 2026 10:00 - 11:00  Conference Room A
```

---

# 9. Booking Update

Users can update their own scheduled bookings subject to company policies.

Changing any of the following requires a fresh availability check:

- Room
- Date
- Start time
- End time

The system must not allow an update that creates a conflict.

The booking history should record important changes.

---

# 10. Booking Cancellation

Users can cancel their own scheduled bookings subject to the configured cancellation policy.

Cancellation should:

- Change status to `CANCELLED`
- Preserve booking history
- Trigger notification email
- Avoid hard deletion of the booking record

Suggested booking statuses:

```text
CONFIRMED
CANCELLED
COMPLETED
```

---

# 11. Participants

A booking can contain multiple participants.

Participants should receive notifications for:

- Booking created
- Booking updated
- Booking cancelled

The system should validate that participant IDs belong to the same company unless cross-company participation is explicitly introduced as a future requirement.

---

# 12. Email Notifications

Email should be sent to participants when a booking is:

- Created
- Updated
- Cancelled

Recommended event-based design:

```text
BookingService
      |
      v
BookingCreatedEvent
BookingUpdatedEvent
BookingCancelledEvent
      |
      v
Notification Listener
      |
      v
Email Service
      |
      v
Participants
```

Email processing should not unnecessarily block the booking API response.

For V1, Spring application events/background processing are sufficient. Kafka/RabbitMQ can be introduced later if higher reliability or scale requires it.

---

# 13. Calendar and Booking Views

## Employee

Provide:

- My Bookings
- Upcoming bookings
- Past bookings
- Cancelled bookings
- Booking details
- Edit booking
- Cancel booking
- Calendar view

## Company Admin

Provide:

- Company booking calendar
- Room-wise booking view
- Search/filter bookings
- Employee/booker information
- Booking details

---

# 14. Security Requirements

Use:

- Spring Security
- JWT authentication
- Role-based authorization
- Company/tenant-level authorization

Roles:

```text
SUPER_ADMIN
COMPANY_ADMIN
EMPLOYEE
```

JWT can contain claims such as:

```text
userId
companyId
role
```

Authorization must enforce both:

1. User role
2. Company ownership/tenant boundary

Example:

> Company A Admin must not access Company B employees, rooms, or bookings even if they manually change IDs in an API request.

All sensitive authorization checks must therefore happen in the backend.

---

# 15. Multi-Tenant Data Isolation

The system is multi-company.

Company-owned data must be isolated.

```text
Company A
├── Departments
├── Employees
├── Rooms
└── Bookings

Company B
├── Departments
├── Employees
├── Rooms
└── Bookings
```

Relevant tables should contain `company_id` where appropriate.

Never trust a `companyId` supplied by the frontend for authorization. Derive the user's company from the authenticated security context/JWT and validate ownership on the backend.

---

# 16. Audit Logging

Important operations should be audited.

Example:

```text
User       Action       Entity
----------------------------------------
admin1     CREATE       COMPANY
admin2     CREATE       EMPLOYEE
rahul      CREATE       BOOKING
rahul      CANCEL       BOOKING
admin2     UPDATE       ROOM
```

Suggested fields:

```text
id
user_id
company_id
action
entity_type
entity_id
timestamp
old_value
new_value
```

Audit records should be retained independently from booking deletion/deactivation logic.

---

# 17. Database Entities

Core entities:

```text
User
Role
Company
Department
Employee
Room
Booking
BookingParticipant
BookingHistory
EmailNotification
AuditLog
BookingPolicy
```

Main relationships:

```text
Company
  |
  +-- Department
  |      |
  |      +-- Employee
  |
  +-- Room
  |
  +-- User
         |
         +-- Booking
                |
                +-- BookingParticipant
                |
                +-- BookingHistory
```

---

# 18. High-Level Architecture

```text
                         +------------------+
                         |      React       |
                         |     + Vite       |
                         +--------+---------+
                                  |
                              REST/JSON
                                  |
                                  v
                    +--------------------------+
                    |       Spring Boot        |
                    |                          |
                    | Spring Security + JWT    |
                    |                          |
                    | Company Management       |
                    | Department Management    |
                    | Employee Management      |
                    | Room Management           |
                    | Booking Management       |
                    | Availability Service     |
                    | Notification Service     |
                    | Audit Service            |
                    +------------+-------------+
                                 |
                    +------------+------------+
                    |                         |
                    v                         v
              +-----------+             +-----------+
              |   MySQL   |             |   Email   |
              |           |             |  Service  |
              +-----------+             +-----------+
```

---

# 19. Backend Architecture

Use a modular monolith rather than microservices for V1.

Suggested package structure:

```text
com.company.roombooking

├── auth
│   ├── controller
│   ├── service
│   ├── repository
│   └── security
│
├── company
│   ├── controller
│   ├── service
│   ├── repository
│   └── model
│
├── department
├── employee
├── room
│
├── booking
│   ├── controller
│   ├── service
│   ├── repository
│   ├── model
│   ├── validator
│   └── event
│
├── notification
│   └── email
│
└── common
    ├── exception
    ├── response
    ├── audit
    └── security
```

---

# 20. Frontend Architecture

React is a separate application inside the same repository.

```text
frontend/
├── src/
│   ├── api/
│   │   ├── authApi.js
│   │   ├── bookingApi.js
│   │   ├── roomApi.js
│   │   ├── companyApi.js
│   │   └── employeeApi.js
│   │
│   ├── components/
│   │   ├── RoomCard/
│   │   ├── BookingForm/
│   │   ├── Calendar/
│   │   └── Availability/
│   │
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Companies/
│   │   ├── Departments/
│   │   ├── Employees/
│   │   ├── Rooms/
│   │   └── Bookings/
│   │
│   ├── layouts/
│   ├── auth/
│   ├── hooks/
│   ├── utils/
│   └── App.jsx
│
├── public/
├── package.json
└── vite.config.js
```

---

# 21. Repository Structure

One Git repository containing two applications:

```text
room-booking/
│
├── src/                         # Spring Boot
│   └── main/
│       ├── java/
│       └── resources/
│
├── frontend/                   # React
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── pom.xml                     # Spring Boot
├── README.md
└── .gitignore
```

During development:

```text
React
localhost:5173
       |
       | REST API
       v
Spring Boot
localhost:8080
       |
       v
MySQL
localhost:3306
```

React and Spring Boot remain separate applications during development while sharing the same Git repository.

---

# 22. REST API Overview

## Authentication

```http
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
```

## Super Admin

```http
POST   /api/admin/companies
GET    /api/admin/companies
GET    /api/admin/companies/{id}
PUT    /api/admin/companies/{id}
DELETE /api/admin/companies/{id}

POST   /api/admin/companies/{id}/admins
PUT    /api/admin/company-admins/{id}
DELETE /api/admin/company-admins/{id}
```

## Company Administration

```http
GET    /api/company/departments
POST   /api/company/departments
PUT    /api/company/departments/{id}
DELETE /api/company/departments/{id}

GET    /api/company/employees
POST   /api/company/employees
PUT    /api/company/employees/{id}
DELETE /api/company/employees/{id}

GET    /api/company/rooms
POST   /api/company/rooms
PUT    /api/company/rooms/{id}
DELETE /api/company/rooms/{id}
```

## Booking

```http
GET    /api/rooms/availability
POST   /api/bookings
GET    /api/bookings/my
GET    /api/bookings/{id}
PUT    /api/bookings/{id}
DELETE /api/bookings/{id}
```

---

# 23. Booking Request Example

```json
{
  "roomId": 12,
  "title": "Project Discussion",
  "description": "Discuss project milestones",
  "startTime": "2026-09-18T10:00:00",
  "endTime": "2026-09-18T11:30:00",
  "participantIds": [
    101,
    102,
    105
  ]
}
```

---

# 24. Booking Service Responsibilities

The booking service should be the authoritative business layer for booking operations.

A typical booking flow:

```text
Request
   |
   v
Authenticate User
   |
   v
Validate Role + Company
   |
   v
Validate Booking Policy
   |
   v
Validate Room
   |
   v
Validate Participants
   |
   v
Check Availability
   |
   v
Transactional Conflict Protection
   |
   v
Create/Update Booking
   |
   +----> Booking History
   |
   +----> Audit Log
   |
   +----> Booking Event
                 |
                 v
            Email Notification
```

---

# 25. Important Booking Validation Rules

Before creating/updating a booking:

1. User must be authenticated.
2. User must have permission to book.
3. Room must belong to the user's company.
4. Room must be active/available.
5. Start time must be before end time.
6. Booking duration must satisfy company policy.
7. Requested date must satisfy maximum advance-booking policy.
8. Participants must be valid.
9. Participant/company rules must be satisfied.
10. Existing conflicting bookings must be checked.
11. Concurrent requests must be protected from double booking.

---

# 26. Suggested Error Handling

Use consistent API error responses.

Example:

```json
{
  "timestamp": "2026-09-18T09:30:00Z",
  "status": 409,
  "code": "ROOM_NOT_AVAILABLE",
  "message": "The selected room is not available for the requested time.",
  "details": {
    "roomId": 12
  }
}
```

Suggested HTTP semantics:

```text
400 Bad Request       -> Validation error
401 Unauthorized      -> Missing/invalid authentication
403 Forbidden         -> Insufficient permission
404 Not Found         -> Resource does not exist
409 Conflict          -> Booking conflict
422 Unprocessable     -> Business rule violation
500 Internal Server   -> Unexpected server error
```

---

# 27. Development Phases

## Phase 1 — Foundation

- Spring Boot project
- React/Vite project
- MySQL
- Flyway
- Environment configuration
- Base exception/response handling
- Repository structure

## Phase 2 — Authentication & Security

- User management
- Roles
- JWT
- Spring Security
- Password hashing
- Company-level authorization
- Protected API endpoints

## Phase 3 — Organization

- Companies
- Company Admins
- Departments
- Employees
- Rooms

## Phase 4 — Booking Engine

- Availability checking
- Future-date booking
- Create booking
- Update booking
- Cancel booking
- Participant management
- Double-booking prevention
- Booking history

## Phase 5 — Smart Availability

- Alternative room at same time
- Nearest available time
- Nearest future date
- Same-duration slot suggestions

## Phase 6 — Notifications

- Booking-created email
- Booking-updated email
- Booking-cancelled email
- Notification history/retry handling as appropriate

## Phase 7 — Enterprise Features

- Audit logging
- Calendar
- Search/filtering
- Pagination
- Dashboard
- Booking policies
- Reporting

## Phase 8 — Future AI Integration

Spring AI can be added later as another interface to existing business services.

```text
User
 |
 +---- Normal React UI ----+
 |                         |
 +---- AI Assistant -------+
                           |
                           v
                    BookingService
                           |
                           v
                         MySQL
```

AI should not become the source of truth for availability or booking conflicts.

The deterministic Java/MySQL booking engine remains authoritative.

---

# 28. Future AI Integration Design

AI is explicitly **out of scope for V1**.

When introduced, AI may interpret natural-language requests such as:

```text
"Book a room tomorrow from 2 to 3 PM for 6 people."
```

The AI layer can translate the request into controlled application operations such as:

```text
findAvailableRooms()
findNearestSlot()
createBooking()
cancelBooking()
getMyBookings()
```

The AI must call controlled backend services rather than directly modifying the database.

Architecture:

```text
                    +-------------------+
                    |   AI Assistant    |
                    +---------+---------+
                              |
                              v
                     Controlled Tools
                              |
                              v
                    +-------------------+
                    | Booking Service   |
                    | Availability      |
                    | Policy Validation |
                    +---------+---------+
                              |
                              v
                            MySQL
```

---

# 29. Non-Functional Requirements

## Security

- Passwords must never be stored in plain text.
- Use strong password hashing.
- JWT validation must occur on protected endpoints.
- Enforce tenant isolation on the backend.
- Validate all resource ownership.
- Avoid trusting IDs/company IDs supplied by clients.
- Apply appropriate CORS and security headers.

## Performance

- Use database indexes for frequently queried fields.
- Availability queries should be optimized.
- Paginate large employee, room, and booking lists.
- Avoid N+1 queries.
- Email sending should not unnecessarily block booking transactions.

## Reliability

- Booking operations should be transactional.
- Booking conflicts must be protected under concurrent requests.
- Important state changes should be auditable.
- Failed notifications should be traceable.

## Maintainability

- Keep business logic in services.
- Keep controllers thin.
- Separate DTOs from persistence entities.
- Centralize exception handling.
- Keep modules logically separated.
- Use Flyway for every database schema change.

---

# 30. V1 Success Criteria

The V1 system should allow a company to:

1. Manage departments.
2. Manage employees.
3. Manage rooms.
4. Configure booking policies.
5. Search room availability.
6. Book rooms for future dates.
7. Prevent double bookings.
8. Update bookings.
9. Cancel bookings.
10. Add participants.
11. Suggest nearest available alternatives.
12. Send email notifications.
13. Maintain booking/audit history.
14. Securely isolate company data.
15. Provide role-based access.
16. Provide employee and company-admin booking views.
17. Support calendar-based booking visibility.

---

# 31. Final Architecture Principles

The core principles for the project are:

1. **Modular monolith for V1** — do not introduce microservices without a real requirement.
2. **Backend is authoritative** — all important validation and authorization happens in Spring Boot.
3. **Database is authoritative for booking state** — AI and React must never be the source of truth.
4. **Tenant isolation is mandatory** — users must only access resources belonging to their company.
5. **Booking operations must be transactional** — concurrent requests must not create double bookings.
6. **Policies are configurable** — avoid hard-coded company booking rules.
7. **History should be preserved** — use cancellation/status changes rather than destructive deletion for bookings.
8. **Notifications are decoupled** — email failures should not unnecessarily break successful booking transactions.
9. **AI is optional and future-facing** — Spring AI can be added without replacing the core booking engine.
10. **React and Spring Boot remain separate applications during development** while living in the same repository.

