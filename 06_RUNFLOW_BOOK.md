# Execution Runflow Book
## Online Hostel Management System

This document describes **how the system actually runs, end-to-end** — the real sequence of events across student, warden, backend, and (external) college Smart Portal. Use this for your project report's "System Flow" section, and as a checklist during development/demo to make sure nothing is missed.

---

## 1. Full System Flow Diagram (textual)

```
STUDENT                          SYSTEM (Your App)                    COLLEGE SMART PORTAL
   |                                    |                                      |
   |--- Register (email/pass) --------->|                                      |
   |                                    |--- Send verification email --------->|  (via student's inbox)
   |<-- Verify email ------------------ |                                      |
   |--- Login -------------------------->|                                      |
   |<-- JWT + dashboard -----------------|                                      |
   |                                    |                                      |
   |--- Browse rooms ------------------->|                                      |
   |--- Apply (pick sharing type) ------>|                                      |
   |                                    |--- Create application (pending) ----|
   |                                    |                                      |
   |                           [WARDEN reviews & approves]                     |
   |                                    |--- Assign room, ↑ occupied_count ---|
   |                                    |--- Generate payment reference ------|
   |<-- Allocation + payment ref -------|                                      |
   |                                    |                                      |
   |--- Click "Pay Now" ---------------->|--- Redirect to Smart Portal -------->|
   |                                                                           |
   |------------------------- Pays fee on Smart Portal ---------------------->|
   |<------------------------- Receives receipt/txn ID -----------------------|
   |                                    |                                      |
   |--- Return to app, submit txn ID -->|                                      |
   |                                    |--- Payment status: Submitted -------|
   |                                    |                                      |
   |                           [WARDEN verifies txn ID against receipt]        |
   |                                    |--- Payment status: Verified --------|
   |<-- Confirmation email + receipt PDF|                                      |
   |                                    |                                      |
   |--- Room booking now fully confirmed and visible in dashboard ----------->|
```

---

## 2. Detailed Runflow: Student Journey

| Step | Action | System Response |
|---|---|---|
| 1 | Student opens app, clicks Register | Form: name, email, roll no, course, year, phone, password |
| 2 | Submits form | Backend creates `users` + `students` row, sends verification email |
| 3 | Clicks verification link/enters OTP | `is_verified = true` |
| 4 | Logs in | Backend validates credentials, issues JWT, frontend stores it (memory/httpOnly cookie preferred) |
| 5 | Lands on Student Dashboard | Shows: application status (none yet), quick links to Browse Rooms |
| 6 | Browses rooms, filters by sharing type | Frontend calls `GET /api/rooms?type=4-sharing` |
| 7 | Clicks Apply | Frontend calls `POST /api/applications` → status `pending` |
| 8 | Waits for warden approval | Dashboard shows "Application Pending" |
| 9 | Gets notified (email) of approval | Dashboard now shows assigned room + "Pay Fees" button with reference number |
| 10 | Clicks "Pay Now" | Opens college Smart Portal in new tab (external, out of your system's control) |
| 11 | Pays on Smart Portal, gets transaction ID/receipt | (Happens entirely outside your app) |
| 12 | Returns to app, enters transaction ID + uploads receipt | `POST /api/payments/:id/submit` → status `submitted` |
| 13 | Waits for warden verification | Dashboard shows "Payment Under Verification" |
| 14 | Gets notified (email) of verification | Dashboard shows "Room Confirmed" + downloadable receipt PDF |
| 15 | (Anytime after) Raises a complaint if needed | `POST /api/complaints` → tracked through resolution |

---

## 3. Detailed Runflow: Warden Journey

| Step | Action | System Response |
|---|---|---|
| 1 | Logs into Warden Dashboard | Sees overview: pending applications, pending payments, occupancy stats |
| 2 | Opens "Pending Applications" queue | List of students who applied, with sharing type requested |
| 3 | Clicks Approve on an application | Backend: transaction checks room capacity → assigns room → increments `occupied_count` → generates payment reference → application status `approved` |
| 4 | (If room type full) Clicks Reject | Application status `rejected`, student notified |
| 5 | Opens "Payment Verification Queue" | List of students who submitted transaction IDs, with receipt attached |
| 6 | Cross-checks transaction ID/receipt manually | Clicks Verify → payment status `verified`, or Reject → status `rejected` (student notified either way) |
| 7 | Opens "Complaints" board | Sees all complaints grouped by status |
| 8 | Updates a complaint to "In Progress" / "Resolved" | Student notified of status change |
| 9 | Views Analytics tab | Occupancy %, revenue collected, defaulters list — all auto-generated from DB, no manual computation |

---

## 4. Critical System Rules (must hold true at all times)

1. **No room ever exceeds its capacity.** Approval logic must check `occupied_count < capacity` inside a transaction before assigning — this prevents two simultaneous approvals from overbooking.
2. **No student has two active applications.** Enforce at application-creation time.
3. **Every payment has a unique reference number**, generated by your system — this is what makes the "Option 1" redirect flow auditable even without a real payment callback.
4. **A room is not "confirmed" until payment status is `verified`** — not just `submitted`. This distinction matters and should be visibly different in the UI (e.g., yellow "pending verification" badge vs green "confirmed" badge).
5. **Everything is warden-actionable from the dashboard.** If any step still requires the warden to do something outside the app (e.g., checking a physical register), the "fully online" goal is broken — double check this while building.

---

## 5. Error / Edge Case Runflows (for testing & report)

| Scenario | Expected System Behavior |
|---|---|
| Two students apply for the last seat in a 4-sharing room at the same time | Only one gets approved; the other's approval attempt fails gracefully with "Room no longer available," prompting re-application |
| Student enters an invalid/fake transaction ID | Payment stays in `submitted` state until warden rejects it manually (no automated fraud detection needed for MVP — note this as a known limitation) |
| Student tries to apply for a second room while one is already pending/approved | Blocked with a clear error message |
| JWT expires mid-session | Frontend redirects to login with a "Session expired" message |
| Warden rejects a payment | Student notified, payment status reset to allow re-submission of a corrected transaction ID |
| Student never returns to submit a transaction ID after redirect | Application/payment remains in `pending` indefinitely — worth adding a reminder email after X days as a "should-have" feature |

---

## 6. Demo Script (suggested order for presenting the project)

1. **Show the problem** (30 sec): explain current offline hostel process pain points.
2. **Student journey live demo** (2–3 min): register → verify → apply for room → get approved → click Pay Now (show Smart Portal redirect) → submit dummy transaction ID.
3. **Switch to warden view** (2 min): approve application, verify payment, show occupancy grid update in real time.
4. **Complaint flow** (1 min): student raises complaint → warden resolves it → student sees status change.
5. **Analytics dashboard** (30 sec): show charts — occupancy %, revenue.
6. **Explain the "why" behind the Smart Portal redirect design** (30 sec): be upfront that direct backend integration isn't possible without institutional access, and that this redirect + verification pattern is how many real systems handle third-party payment portals they don't control.
7. **Wrap up** (30 sec): mention what you'd add with more time (stretch features).

---

## 7. Quick Reference — API Endpoint Map

```
AUTH
POST   /api/auth/register
POST   /api/auth/verify-email
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

ROOMS
GET    /api/rooms

APPLICATIONS
POST   /api/applications
GET    /api/applications/me
GET    /api/applications              (warden)
PATCH  /api/applications/:id/approve  (warden)
PATCH  /api/applications/:id/reject   (warden)

PAYMENTS
POST   /api/payments/initiate
GET    /api/payments/me
POST   /api/payments/:id/submit
GET    /api/payments/pending-verification  (warden)
PATCH  /api/payments/:id/verify            (warden)

COMPLAINTS
POST   /api/complaints
GET    /api/complaints/me
GET    /api/complaints                (warden)
PATCH  /api/complaints/:id/status     (warden)
```
