# 🏨 HostelFlow — Online Hostel Management System (HMS)

> A 100% paperless, web-based hostel management system streamlining student room applications, fee reconciliations via the college Smart Portal, and warden administrative operations.

---

## 🌟 Key Highlights

- **Dual-Role Architecture**: Dedicated portals for **Students** and **Warden Administrators**.
- **Real-Time Room Inventory**: Non-AC accommodation across 4 sharing tiers (Single, Double, Triple, 4-Sharing) with live capacity badges.
- **Zero-Overbooking Guarantee**: Strict atomic concurrency locks (`occupied_count < capacity`) executed inside database transactions.
- **Smart Portal Payment Flow (Option 1)**: Internal unique challan generation (`HMS2026-STUxxxx`), one-click redirect to the college **MMMUT Samarth Fee Portal**, and student transaction ID/receipt audit queue.
- **Maintenance & Complaints Desk**: Kanban-style triage board (`Pending` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`) with photo attachments and student email alerts.
- **Telemetry & Analytics**: Visual Block & Floor occupancy matrix plus interactive Recharts graphs for bed utilization and fee projections.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 3.4, React Router 7 |
| **Icons & Visuals** | Lucide React, Google Fonts (*Plus Jakarta Sans* & *Inter*), Recharts |
| **Backend API** | Node.js, Express.js (REST API, CORS, centralized error handling) |
| **Database & ORM** | SQLite (zero-config local) / PostgreSQL compatible via Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens) with role-based access control + `bcryptjs` password hashing |
| **File Handling** | Multer for receipt and maintenance photo uploads |
| **Notifications** | Nodemailer with dev simulation and production SMTP support |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v25 / v20 / v18)
- **npm** v9+

### 2. Backend Setup
```bash
# Navigate to backend directory
cd server

# Install dependencies (already installed)
npm install

# Push Prisma schema to local database
npx prisma db push

# Seed initial warden, student, and room inventory
npm run seed

# Start backend server (runs on port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
# In a separate terminal, navigate to client directory
cd client

# Install dependencies (already installed)
npm install

# Start Vite frontend (runs on port 5173)
npm run dev
```

Visit [**http://localhost:5173**](http://localhost:5173) in your browser.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Pre-seeded Profile |
|---|---|---|---|
| **Warden Admin** | `warden@hostel.edu` | `WardenPass123!` | Dr. Alok Verma (All Blocks) |
| **Student** | `student@college.edu` | `StudentPass123!` | Rahul Sharma (`21BCE1042`, 3rd Year) |

> 💡 **Tip:** Both accounts can also be autofilled with one click using the demo cards on the login page!

---

## 🔄 End-to-End Operational Workflow

```
STUDENT                                SYSTEM                                 WARDEN
   |                                     |                                       |
   |--- Register / Login --------------->|                                       |
   |--- Browse rooms & apply ----------->|                                       |
   |                                     |--- Application queued --------------->|
   |                                     |                                       |
   |                                     |<-- Approves application --------------|
   |                                     |    (Locks bed, generates challan)     |
   |                                     |                                       |
   |<-- Receives challan reference ------|                                       |
   |--- Clicks "Pay on Smart Portal" --->| (Redirects to MMMUT Samarth Portal)  |
   |--- Submits Txn ID & Receipt ------->|                                       |
   |                                     |--- Payment enters verification queue->|
   |                                     |                                       |
   |                                     |<-- Audits proof & verifies -----------|
   |                                     |                                       |
   |<-- Booking 100% Confirmed ----------|                                       |
   |                                     |                                       |
   |--- Raises maintenance ticket ------>|                                       |
   |                                     |--- Appears on Kanban board ---------->|
   |                                     |<-- Dispatches technician / resolves---|
```

---

## 📂 Project Structure

```
Hostel Management system/
├── client/                     # Frontend React (Vite) application
│   ├── src/
│   │   ├── api/                # Modular API services (auth, rooms, applications, etc.)
│   │   ├── components/common/  # Navbar, Sidebar, Modal, StatusBadge, ProtectedRoute
│   │   ├── context/            # AuthContext (state & token persistence)
│   │   ├── pages/auth/         # Login, Register, VerifyEmail, ForgotPassword
│   │   ├── pages/student/      # StudentDashboard, BrowseRooms, PaymentPage, MyComplaints
│   │   ├── pages/warden/       # WardenDashboard, ApplicationsQueue, PaymentVerificationQueue, etc.
│   │   ├── App.jsx             # Role-protected routing configuration
│   │   └── index.css           # Tailwind design tokens & typography
│   ├── vite.config.js          # Dev server with /uploads proxy
│   └── package.json
│
├── server/                     # Backend Express.js API
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma ORM models
│   │   └── seed.js             # Seed script (warden, student, 18 non-AC rooms)
│   ├── src/
│   │   ├── controllers/        # Business logic controllers
│   │   ├── middleware/         # Auth, Role, Upload (Multer), Error handling
│   │   ├── routes/             # Express API routers
│   │   ├── services/           # Email & Reference generation services
│   │   └── app.js              # Express app configuration
│   ├── uploads/                # Local uploaded file storage (receipts, photos)
│   ├── test_api.js             # Automated 14-step integration test suite
│   ├── index.js                # Server entry point (port 5000)
│   └── package.json
│
└── README.md                   # Project documentation
```

---

## 🧪 Testing

To run the full 14-step integration test suite covering registration, atomic room locking, duplicate prevention, payment verification, and complaints:

```bash
cd server
node test_api.js
```
All 14 tests run synchronously against the Express server and verify the complete lifecycle.

---
