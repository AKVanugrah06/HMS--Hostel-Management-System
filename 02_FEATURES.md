# Features Document
## Online Hostel Management System

Features are grouped by module and tagged by priority:
- 🟥 **Must-have (MVP)** — required for the core project to function
- 🟨 **Should-have** — makes the project feel complete/professional
- 🟩 **Nice-to-have (Stretch)** — extra credit / impressiveness features

---

## 1. Authentication & Student Registration

| Feature | Priority |
|---|---|
| Student sign-up with college email + password | 🟥 |
| Email verification (OTP or verification link) | 🟥 |
| Login with JWT-based session | 🟥 |
| Forgot password / reset password flow | 🟥 |
| Student profile (name, course, year, phone, emergency contact, ID proof upload) | 🟥 |
| Warden/Admin login (separate role, seeded manually — no public warden signup) | 🟥 |
| Role-based access control (Student vs Warden) | 🟥 |
| Profile photo upload | 🟨 |
| Two-factor login for warden accounts | 🟩 |

---

## 2. Room Management & Allocation

| Feature | Priority |
|---|---|
| Room categories: Single / Double / Triple / 4-Sharing (all non-AC) | 🟥 |
| Real-time room availability listing | 🟥 |
| Filter/sort rooms by sharing type | 🟥 |
| Room application form (student selects sharing type/preference) | 🟥 |
| Auto-assignment of room on approval (system picks an available room of chosen type) | 🟥 |
| Prevent overbooking (capacity check at allocation time, transaction-safe) | 🟥 |
| Warden approval/rejection of applications | 🟥 |
| Block/floor-wise visual occupancy grid for warden (green = available, red = full) | 🟨 |
| Room change / vacate request workflow | 🟨 |
| Manual room number selection by student (instead of auto-assign) | 🟩 |
| Roommate preference matching | 🟩 |

---

## 3. Fee Payment (via College Smart Portal Redirect)

| Feature | Priority |
|---|---|
| Auto fee calculation based on room type | 🟥 |
| System-generated unique reference/challan number per application | 🟥 |
| "Pay Now" button that redirects student to college Smart Portal | 🟥 |
| Post-payment form: student submits transaction ID | 🟥 |
| Optional receipt/screenshot upload as proof | 🟥 |
| Payment status states: Pending → Submitted → Verified / Rejected | 🟥 |
| Warden's "Payment Verification Queue" with Approve/Reject action | 🟥 |
| Auto-generated payment confirmation PDF once verified | 🟨 |
| Fee due reminder emails | 🟨 |
| Partial payment support | 🟩 |
| Config flag to swap in a real gateway (Razorpay/Stripe test mode) for demo purposes | 🟩 |

---

## 4. Warden Dashboard

| Feature | Priority |
|---|---|
| Overview stats: total students, rooms filled/available, pending approvals | 🟥 |
| Room application approval/rejection screen | 🟥 |
| Payment verification queue | 🟥 |
| Student directory (search/filter by name, room, payment status) | 🟥 |
| Fee defaulters list | 🟨 |
| Occupancy analytics (charts: occupancy %, revenue collected, room-type distribution) | 🟨 |
| Exportable reports (CSV/PDF) | 🟩 |
| Multi-warden / multi-block management | 🟩 |

---

## 5. Complaint & Maintenance Module

| Feature | Priority |
|---|---|
| Student raises complaint (category: electrical/plumbing/wifi/other + description + optional photo) | 🟥 |
| Complaint status tracking: Pending → In Progress → Resolved | 🟥 |
| Warden dashboard to view/update all complaints | 🟥 |
| Student notified when status changes | 🟨 |
| Complaint history per student/room | 🟨 |
| Priority tagging (urgent/normal) | 🟩 |

---

## 6. Notifications

| Feature | Priority |
|---|---|
| Email on registration confirmation | 🟥 |
| Email on room allocation confirmation | 🟥 |
| Email on payment verification | 🟥 |
| Email on complaint status update | 🟨 |
| In-app notification bell/center | 🟨 |
| SMS notifications | 🟩 |

---

## 7. Stretch Modules (Pick 1–2 if time allows)

| Feature | Priority |
|---|---|
| Leave/Outpass management (student requests leave, warden approves digitally) | 🟩 |
| Visitor management (log visitor entries online) | 🟩 |
| Mess/food management (meal preference, menu display, feedback) | 🟩 |
| Document verification tracker (ID proof, admission letter status) | 🟩 |

---

## Recommended Build Priority Order

1. Auth (student + warden)
2. Room listing + application + allocation
3. Payment (redirect + verification)
4. Warden dashboard core (approvals + verification queue)
5. Complaints module
6. Notifications
7. Analytics/charts polish
8. Pick 1 stretch module if time remains (Outpass is usually the easiest and most impressive)
