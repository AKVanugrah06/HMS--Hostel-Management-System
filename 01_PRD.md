# Product Requirements Document (PRD)
## Online Hostel Management System (HMS)

---

### 1. Project Overview

**Problem Statement:**
Hostel administration in most colleges is still largely offline or semi-offline — students physically visit the warden's office to apply for rooms, submit fee receipts, and raise complaints. This causes delays, paperwork errors, lost records, and lack of transparency in room allocation and fee tracking.

**Solution:**
A fully online Hostel Management System where every interaction between a student and the warden — registration, room allocation, fee payment, and complaints — happens digitally. No offline/manual paperwork is required from the warden's side.

**Goal:**
Build a web-based system where:
- Students can register, apply for a room, pay fees (via redirect to the college Smart Portal), and track everything online.
- Wardens can manage rooms, verify payments, and handle complaints entirely from a dashboard — with zero manual/paper processes.

---

### 2. Target Users

| Role | Description |
|---|---|
| **Student** | Registers, applies for hostel room, pays fees, raises complaints, tracks status |
| **Warden (Admin)** | Manages room inventory, approves allocations, verifies payments, resolves complaints |
| **Super Admin** *(optional/stretch)* | Manages multiple wardens/hostel blocks, views global reports |

---

### 3. Objectives

1. Eliminate physical paperwork from hostel administration.
2. Provide real-time visibility of room availability to students.
3. Digitize the fee payment tracking process (via redirect to existing college Smart Portal + manual transaction verification).
4. Give wardens a single dashboard to manage all operations.
5. Maintain a complete digital audit trail — who applied, who paid, who approved, when.

---

### 4. Scope

**In Scope (Core Project):**
- Student registration & authentication
- Room listing with sharing types (Single / Double / Triple / 4-Sharing) — all non-AC
- Room application & allocation workflow
- Fee payment via redirect to college Smart Portal + transaction ID submission + warden verification
- Warden dashboard (approvals, payment verification, occupancy view)
- Complaint/maintenance module
- Notifications (email at minimum)

**Out of Scope (Not building, or stretch-only):**
- Direct API integration with the college's actual payment backend (no institutional access available)
- Mobile app (web-responsive only, unless time permits)
- Mess/food management (optional stretch goal)
- Visitor management (optional stretch goal)

---

### 5. Key Design Decisions (Locked-in from discussion)

| Decision | Reasoning |
|---|---|
| All rooms are **non-AC** | Matches real hostel setup — simplifies room model |
| Room types are **Single / Double / Triple / 4-Sharing** | Based on capacity/occupancy, not amenities |
| Fee payment uses **Option 1: Redirect to college Smart Portal** | Realistic — no backend API access to college portal exists, so system generates a reference number, redirects student to pay externally, and captures the transaction ID afterward for warden verification |
| Payment status is **trust-based until warden verifies** | Since there's no automated payment confirmation callback, a "Pending Verification" state is required — this is an honest, defensible real-world design choice |

---

### 6. User Stories

**Student:**
- As a student, I want to register with my college email so that only verified students can apply.
- As a student, I want to see live room availability by sharing type so I can choose what fits my budget.
- As a student, I want to apply for a room and get a reference number so I can pay fees against it.
- As a student, I want to be redirected to my college's Smart Portal to pay so I don't need a new payment method.
- As a student, I want to submit my transaction ID/receipt after paying so the warden can confirm my payment.
- As a student, I want to raise complaints about my room online instead of visiting the warden's office.
- As a student, I want to track my application, payment, and complaint status anytime.

**Warden:**
- As a warden, I want to see all pending room applications and approve/reject them.
- As a warden, I want to see all payments awaiting verification and confirm them with one click.
- As a warden, I want a real-time view of room occupancy (block/floor-wise) without doing manual counts.
- As a warden, I want to see a list of fee defaulters.
- As a warden, I want to manage complaints (update status: pending → in progress → resolved) without paper logs.

---

### 7. Success Criteria

- A student can complete the full journey (register → apply → pay → get room confirmed) with **zero physical/offline steps**.
- A warden can complete their entire workflow (approve rooms, verify payments, resolve complaints) **entirely from the dashboard**.
- No double-booking of rooms (capacity is respected in real time).
- Every fee payment has a traceable reference number and audit trail (who submitted, who verified, when).

---

### 8. Assumptions & Constraints

- No official API access to the college's Smart Portal — integration is via redirect + manual transaction ID entry, not a live payment callback.
- This is an academic/portfolio project; it should be architected in a way that a "real" payment gateway (Razorpay/Stripe) could be swapped in with minimal changes, showing awareness of real-world integration patterns.
- Single hostel/institution assumed for MVP; multi-hostel support is a stretch goal.

---

### 9. Milestones (High-Level)

1. Requirements + DB schema finalized
2. Auth system (student + warden) working
3. Room module (listing, application, allocation) working
4. Payment module (redirect + verification flow) working
5. Warden dashboard complete
6. Complaint module + notifications added
7. Testing, polish, deployment
8. Documentation + demo prep
