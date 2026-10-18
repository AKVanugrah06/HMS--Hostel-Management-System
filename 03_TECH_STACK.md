# Tech Stack Document
## Online Hostel Management System

---

### 1. Recommended Stack (MERN-adjacent, but with a relational DB)

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React.js (Vite) + Tailwind CSS | Fast dev experience, component reuse for student/warden dashboards, Tailwind speeds up styling |
| **Frontend routing** | React Router | Standard, simple client-side routing |
| **State management** | React Context API (or Redux Toolkit if app grows large) | Context is enough for a project this size |
| **Backend** | Node.js + Express.js | Simple REST API, huge ecosystem, easy to explain in a viva/demo |
| **Database** | PostgreSQL (or MySQL) | Data is highly relational (Students ↔ Rooms ↔ Payments ↔ Complaints) — a relational DB makes constraints (like room capacity) easy to enforce and ER diagrams clean |
| **ORM** | Prisma (or Sequelize) | Prisma gives type-safe queries + easy migrations, great for a college project timeline |
| **Auth** | JWT (jsonwebtoken) + bcrypt for password hashing | Industry standard, easy to implement and explain |
| **File uploads** | Multer (local storage) or Cloudinary (cloud storage) | ID proofs, receipts, complaint photos |
| **Email service** | Nodemailer + Gmail SMTP, or Resend/SendGrid free tier | For OTP, confirmations, status updates |
| **Charts (analytics)** | Recharts or Chart.js | For occupancy/revenue graphs in warden dashboard |
| **PDF generation** | pdfkit or jsPDF | Auto-generated receipts/confirmations |

---

### 2. Hosting & Deployment

| Component | Recommended Service | Free Tier? |
|---|---|---|
| Frontend | Vercel or Netlify | Yes |
| Backend | Render or Railway | Yes (with sleep/cold-start limits) |
| Database | Neon / Supabase (Postgres) or Railway Postgres | Yes |
| File storage | Cloudinary | Yes (limited) |
| Email | Gmail SMTP (dev) / Resend (prod-like) | Yes |

---

### 3. Alternative Stack Options

If you're more comfortable with a different ecosystem, here are equally valid alternatives:

**Option B — Django-based:**
- Backend: Django + Django REST Framework
- Frontend: React (or Django templates if you want to keep it simpler/single-stack)
- Database: PostgreSQL (native Django support)
- Auth: Django's built-in auth + JWT via `djangorestframework-simplejwt`
- Good if: you're more comfortable with Python, or your college syllabus leans Python

**Option C — Java/Spring Boot-based:**
- Backend: Spring Boot + Spring Security
- Frontend: React
- Database: MySQL/PostgreSQL with JPA/Hibernate
- Good if: your curriculum is Java-heavy and evaluators expect enterprise-style architecture

**Option D — Simplest possible (if timeline is tight):**
- Backend: Node.js + Express
- Frontend: EJS templates (server-rendered, no separate React app)
- Database: MySQL
- Good if: you need to finish fast and don't need a highly interactive UI — trades off polish for speed

> **Recommendation:** Go with the primary stack (React + Node/Express + PostgreSQL + Prisma) unless you have a strong reason to switch — it's the most in-demand skill set and has the most tutorials/community support if you get stuck.

---

### 4. Key Libraries/Packages Reference

**Backend (`package.json`):**
```
express
prisma / @prisma/client
jsonwebtoken
bcryptjs
multer
nodemailer
cors
dotenv
express-validator (input validation)
```

**Frontend (`package.json`):**
```
react
react-router-dom
axios
tailwindcss
recharts
react-hook-form (form handling + validation)
react-hot-toast (notifications/UI feedback)
```

---

### 5. Dev Tools

| Purpose | Tool |
|---|---|
| API testing | Postman or Thunder Client (VS Code extension) |
| Version control | Git + GitHub |
| DB GUI | pgAdmin / Prisma Studio / TablePlus |
| Environment config | `.env` files (never commit secrets) |
| Code formatting | Prettier + ESLint |

---

### 6. Why Not MongoDB Here

MongoDB is tempting for speed, but this project has strict relational rules that matter a lot:
- A room has a fixed capacity that must never be exceeded.
- A payment must always map to exactly one student and one application.
- Fee defaulter reports need reliable JOIN-style queries.

A relational DB (PostgreSQL) enforces these rules at the schema level (foreign keys, constraints) instead of you having to manually check them in application code every time — fewer bugs, and it maps directly to the ER diagram you'll likely need for your project report anyway.
