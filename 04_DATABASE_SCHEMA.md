# Database Schema
## Online Hostel Management System

Relational schema (PostgreSQL/MySQL). Written in a Prisma-style/plain-English format so you can translate it to SQL, Prisma schema, or an ER diagram tool (dbdiagram.io, draw.io) easily.

---

### 1. `users` (base auth table — optional, or split into students/wardens directly)

| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| email | string, unique | college email |
| password_hash | string | bcrypt hashed |
| role | enum('student','warden','super_admin') | |
| is_verified | boolean | email verification status |
| created_at | timestamp | |
| updated_at | timestamp | |

---

### 2. `students`

| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| user_id | FK → users.id | |
| full_name | string | |
| roll_no | string, unique | |
| course | string | |
| year | int | |
| phone | string | |
| emergency_contact | string | |
| id_proof_url | string | uploaded file path |
| profile_photo_url | string | optional |
| created_at | timestamp | |

---

### 3. `wardens`

| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| user_id | FK → users.id | |
| full_name | string | |
| assigned_block | string | optional, for multi-warden setups |
| phone | string | |

---

### 4. `rooms`

| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| room_no | string | e.g. "B-204" |
| block | string | e.g. "Block B" |
| floor | int | |
| sharing_type | enum('single','double','triple','4-sharing') | |
| capacity | int | 1 / 2 / 3 / 4 based on sharing_type |
| occupied_count | int | default 0, updated on allocation/vacate |
| fee_per_head | decimal | per semester/year, based on sharing_type |
| status | enum('available','full','maintenance') | derived/updated automatically |

> **Constraint to enforce in app logic (or DB trigger):** `occupied_count <= capacity` at all times.

---

### 5. `room_applications`

| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| student_id | FK → students.id | |
| preferred_sharing_type | enum | what student requested |
| assigned_room_id | FK → rooms.id, nullable | filled once allocated |
| status | enum('pending','approved','rejected','vacated') | |
| applied_at | timestamp | |
| decided_at | timestamp, nullable | |
| decided_by | FK → wardens.id, nullable | |

---

### 6. `payments`

| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| student_id | FK → students.id | |
| application_id | FK → room_applications.id | |
| amount_due | decimal | pulled from room's fee_per_head |
| reference_no | string, unique | your system's internal challan number, e.g. `HMS2026-STU1023` |
| portal_transaction_id | string, nullable | entered by student after paying on college Smart Portal |
| receipt_upload_url | string, nullable | optional proof screenshot/PDF |
| status | enum('pending','submitted','verified','rejected') | |
| submitted_at | timestamp, nullable | when student entered transaction ID |
| verified_by | FK → wardens.id, nullable | |
| verified_at | timestamp, nullable | |

---

### 7. `complaints`

| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| student_id | FK → students.id | |
| room_id | FK → rooms.id | |
| category | enum('electrical','plumbing','wifi','furniture','other') | |
| description | text | |
| photo_url | string, nullable | |
| status | enum('pending','in_progress','resolved') | |
| raised_at | timestamp | |
| resolved_at | timestamp, nullable | |
| handled_by | FK → wardens.id, nullable | |

---

### 8. `notifications` *(optional table if building in-app notification center)*

| Column | Type | Notes |
|---|---|---|
| id | UUID / PK | |
| user_id | FK → users.id | |
| message | text | |
| type | enum('registration','allocation','payment','complaint') | |
| is_read | boolean, default false | |
| created_at | timestamp | |

---

### 9. Relationships Summary (for ER diagram)

```
users (1) ──── (1) students
users (1) ──── (1) wardens

students (1) ──── (many) room_applications
rooms    (1) ──── (many) room_applications

students (1) ──── (many) payments
room_applications (1) ──── (1) payments

students (1) ──── (many) complaints
rooms    (1) ──── (many) complaints

wardens  (1) ──── (many) room_applications   [decided_by]
wardens  (1) ──── (many) payments            [verified_by]
wardens  (1) ──── (many) complaints          [handled_by]
```

---

### 10. Notes on Enforcing Business Rules

- **No overbooking:** When approving a `room_application`, check `rooms.occupied_count < rooms.capacity` inside a DB transaction before incrementing — this avoids a race condition where two approvals happen at the same time.
- **One active application per student:** Add a unique constraint or app-level check so a student can't have two `pending`/`approved` applications simultaneously.
- **Payment reference uniqueness:** `reference_no` must be unique — this is what ties your system's record to what the student pays on the external Smart Portal.
- **Room status auto-update:** Whenever `occupied_count` changes, recalculate `status` (`available` vs `full`) — do this in application logic or a DB trigger.

---

### 11. Suggested Tool for ER Diagram

Paste the tables above into **dbdiagram.io** (using DBML syntax) or **draw.io** to generate a clean visual ER diagram for your project report. Example DBML snippet to get started:

```dbml
Table students {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  full_name varchar
  roll_no varchar [unique]
}

Table rooms {
  id uuid [pk]
  room_no varchar
  sharing_type varchar
  capacity int
  occupied_count int
}

Table room_applications {
  id uuid [pk]
  student_id uuid [ref: > students.id]
  assigned_room_id uuid [ref: > rooms.id]
  status varchar
}

Table payments {
  id uuid [pk]
  student_id uuid [ref: > students.id]
  application_id uuid [ref: > room_applications.id]
  reference_no varchar [unique]
  status varchar
}
```
