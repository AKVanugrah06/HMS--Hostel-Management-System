# Backend Build Guide (Detailed)
## Online Hostel Management System — Node.js + Express + PostgreSQL + Prisma

This guide goes file-by-file and route-by-route so you can build the backend without guessing structure. Follow phases in order.

---

## 1. Folder Structure

```
server/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── room.routes.js
│   │   ├── application.routes.js
│   │   ├── payment.routes.js
│   │   └── complaint.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── room.controller.js
│   │   ├── application.controller.js
│   │   ├── payment.controller.js
│   │   └── complaint.controller.js
│   ├── services/
│   │   ├── email.service.js
│   │   ├── pdf.service.js
│   │   └── reference.service.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── validators.js
│   └── app.js
├── uploads/                  (local file storage — ID proofs, receipts)
├── .env
├── .env.example
├── .gitignore
├── package.json
└── index.js                  (server entry point)
```

---

## 2. Phase 0 — Project Initialization

```bash
mkdir server && cd server
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken prisma @prisma/client multer nodemailer express-validator uuid
npm install -D nodemon
npx prisma init
```

**`package.json` scripts:**
```json
"scripts": {
  "dev": "nodemon index.js",
  "start": "node index.js",
  "seed": "node prisma/seed.js"
}
```

**`.env.example`:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/hms_db"
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="7d"
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
COLLEGE_SMART_PORTAL_URL=https://your-college-portal.edu/pay
```

**`src/app.js`:**
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const applicationRoutes = require('./routes/application.routes');
const paymentRoutes = require('./routes/payment.routes');
const complaintRoutes = require('./routes/complaint.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);

app.use(errorHandler);

module.exports = app;
```

**`index.js`:**
```javascript
const app = require('./src/app');
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**✅ Checkpoint:** `npm run dev` starts server without errors, hits a test route successfully.

---

## 3. Phase 1 — Database Layer (Prisma)

1. Paste the schema from `04_DATABASE_SCHEMA.md` into `prisma/schema.prisma` (convert tables to Prisma model syntax — example below for one table):

```prisma
model Student {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  fullName          String
  rollNo            String   @unique
  course            String
  year              Int
  phone             String
  emergencyContact  String
  idProofUrl        String?
  profilePhotoUrl   String?
  createdAt         DateTime @default(now())

  applications RoomApplication[]
  payments     Payment[]
  complaints   Complaint[]
}
```

2. Repeat for `User`, `Warden`, `Room`, `RoomApplication`, `Payment`, `Complaint`, `Notification` — use enums for `role`, `sharingType`, `status` fields.
3. Run:
```bash
npx prisma migrate dev --name init
npx prisma generate
```
4. Write `prisma/seed.js` to insert:
   - 1 warden user
   - 15–20 rooms (mix of single/double/triple/4-sharing)
5. Run `npm run seed`, then check with `npx prisma studio`.

**✅ Checkpoint:** All tables created, sample data visible in Prisma Studio.

---

## 4. Phase 2 — Auth Module

**`src/utils/generateToken.js`:**
```javascript
const jwt = require('jsonwebtoken');

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}
module.exports = generateToken;
```

**`src/middleware/auth.middleware.js`:**
```javascript
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
module.exports = authenticate;
```

**`src/middleware/role.middleware.js`:**
```javascript
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}
module.exports = requireRole;
```

**Routes to build (`auth.routes.js` → `auth.controller.js`):**

| Route | Method | Logic |
|---|---|---|
| `/api/auth/register` | POST | Validate input → hash password (bcrypt) → create `User` + `Student` in one transaction → generate OTP/token → email it → return success |
| `/api/auth/verify-email` | POST | Check token/OTP matches → set `isVerified = true` |
| `/api/auth/login` | POST | Find user by email → compare password hash → if valid, generate JWT with `{ id, role }` → return token + user info |
| `/api/auth/forgot-password` | POST | Generate reset token, email a reset link |
| `/api/auth/reset-password` | POST | Verify reset token → update password hash |

**✅ Checkpoint:** Test all 5 routes in Postman. Confirm JWT decodes correctly and protected routes reject requests without a valid token.

---

## 5. Phase 3 — Rooms & Applications Module

**`GET /api/rooms`** (public/authenticated) — supports query params `?sharingType=4-sharing&status=available`
```javascript
async function getRooms(req, res) {
  const { sharingType, status } = req.query;
  const rooms = await prisma.room.findMany({
    where: {
      ...(sharingType && { sharingType }),
      ...(status && { status }),
    },
    orderBy: { roomNo: 'asc' },
  });
  res.json(rooms);
}
```

**`POST /api/applications`** (student only) — must block duplicate active applications:
```javascript
async function applyForRoom(req, res) {
  const studentId = req.user.studentId;
  const { preferredSharingType } = req.body;

  const existing = await prisma.roomApplication.findFirst({
    where: { studentId, status: { in: ['pending', 'approved'] } },
  });
  if (existing) {
    return res.status(400).json({ message: 'You already have an active application' });
  }

  const application = await prisma.roomApplication.create({
    data: { studentId, preferredSharingType, status: 'pending' },
  });
  res.status(201).json(application);
}
```

**`PATCH /api/applications/:id/approve`** (warden only) — **critical race-condition-safe logic**:
```javascript
async function approveApplication(req, res) {
  const { id } = req.params;
  const wardenId = req.user.wardenId;

  const result = await prisma.$transaction(async (tx) => {
    const application = await tx.roomApplication.findUnique({ where: { id } });
    if (!application || application.status !== 'pending') {
      throw new Error('Application not pending');
    }

    // Lock and find an available room of the requested type
    const room = await tx.room.findFirst({
      where: {
        sharingType: application.preferredSharingType,
        occupiedCount: { lt: prisma.room.fields.capacity }, // conceptual — see note below
        status: 'available',
      },
    });
    if (!room) throw new Error('No available room of this type');

    const newOccupiedCount = room.occupiedCount + 1;
    await tx.room.update({
      where: { id: room.id },
      data: {
        occupiedCount: newOccupiedCount,
        status: newOccupiedCount >= room.capacity ? 'full' : 'available',
      },
    });

    const updatedApp = await tx.roomApplication.update({
      where: { id },
      data: {
        status: 'approved',
        assignedRoomId: room.id,
        decidedBy: wardenId,
        decidedAt: new Date(),
      },
    });

    // Generate payment reference (see reference.service.js)
    const referenceNo = generateReferenceNo(application.studentId);
    const payment = await tx.payment.create({
      data: {
        studentId: application.studentId,
        applicationId: application.id,
        amountDue: room.feePerHead,
        referenceNo,
        status: 'pending',
      },
    });

    return { updatedApp, payment, room };
  });

  // Send email outside the transaction
  await sendAllocationEmail(result);
  res.json(result);
}
```

> **Note:** Prisma doesn't support comparing two columns directly in a `where` filter (`occupiedCount < capacity`) in all versions — the practical approach is to fetch candidate rooms of the right type with `status: 'available'` and double-check `occupiedCount < capacity` in JS before updating, all inside the `$transaction` block so it stays atomic. This is the key "no overbooking" guarantee — test it explicitly by simulating two rapid approval calls.

**`src/services/reference.service.js`:**
```javascript
function generateReferenceNo(studentId) {
  const year = new Date().getFullYear();
  const shortId = studentId.slice(0, 6).toUpperCase();
  return `HMS${year}-${shortId}`;
}
module.exports = { generateReferenceNo };
```

**✅ Checkpoint:** Apply → Approve → Room occupancy updates → Payment record auto-created. Test the race condition by firing two approve requests for the last seat concurrently (Postman Runner or a quick script) and confirm only one succeeds.

---

## 6. Phase 4 — Payments Module (Smart Portal Redirect Flow)

| Route | Method | Logic |
|---|---|---|
| `/api/payments/me` | GET | Return student's payment record(s) with status |
| `/api/payments/:id/submit` | POST | Student submits `portalTransactionId` + uploads receipt (via Multer) → status → `submitted`, `submittedAt = now()` |
| `/api/payments/pending-verification` | GET | Warden only — list all `submitted` payments |
| `/api/payments/:id/verify` | PATCH | Warden approves/rejects → status `verified`/`rejected`, `verifiedBy`, `verifiedAt` set → on verify, trigger email + PDF receipt generation |

**`src/middleware/upload.middleware.js`** (Multer config for receipt uploads):
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/receipts'),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF/JPG/PNG allowed'));
    }
  },
});
module.exports = upload;
```

**Submit payment controller (simplified):**
```javascript
async function submitPayment(req, res) {
  const { id } = req.params;
  const { portalTransactionId } = req.body;
  const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : null;

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      portalTransactionId,
      receiptUploadUrl: receiptUrl,
      status: 'submitted',
      submittedAt: new Date(),
    },
  });
  res.json(payment);
}
```

**✅ Checkpoint:** Student can submit a transaction ID + receipt, warden sees it in queue, warden can verify/reject, student's dashboard reflects status change, confirmation email fires on verify.

---

## 7. Phase 5 — Complaints Module

Standard CRUD pattern, same as applications:

| Route | Method | Notes |
|---|---|---|
| `/api/complaints` | POST | Student creates (category, description, optional photo via Multer) |
| `/api/complaints/me` | GET | Student's own complaints |
| `/api/complaints` | GET | Warden — all complaints, filter by `?status=pending` |
| `/api/complaints/:id/status` | PATCH | Warden updates status, sets `resolvedAt` if resolved, triggers notification email |

**✅ Checkpoint:** Full complaint lifecycle testable via Postman; status changes reflected correctly.

---

## 8. Phase 6 — Email Service

**`src/services/email.service.js`:**
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: `"Hostel Management" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
module.exports = { sendEmail };
```

Call this from controllers at: registration, room allocation, payment verification, complaint status change.

**✅ Checkpoint:** Real emails land in a test inbox for each of the 4 trigger points.

---

## 9. Phase 7 — Error Handling & Validation

**`src/middleware/error.middleware.js`:**
```javascript
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Server error' });
}
module.exports = errorHandler;
```

Use `express-validator` on all POST/PATCH routes to validate body shape before hitting controllers (e.g., email format, required fields, enum values).

---

## 10. Phase 8 — Testing Checklist Before Moving to Frontend Integration

- [ ] All routes tested individually in Postman with valid + invalid inputs
- [ ] JWT auth blocks unauthenticated requests on protected routes
- [ ] Role middleware blocks students from hitting warden-only routes
- [ ] Overbooking race condition tested and confirmed impossible
- [ ] File uploads (ID proof, receipt, complaint photo) work and are retrievable via `/uploads/...`
- [ ] All emails fire correctly
- [ ] Postman collection exported and saved to repo (`docs/postman_collection.json`) for reference

---

## 11. Deployment Notes (Backend)

1. Push code to GitHub.
2. On Render/Railway: create new Web Service, connect repo, set root directory to `server/`.
3. Add all `.env` variables in the platform's environment settings (never commit `.env`).
4. Set build command: `npm install && npx prisma generate && npx prisma migrate deploy`
5. Set start command: `npm start`
6. Point `DATABASE_URL` to your cloud Postgres instance (Neon/Supabase).
7. Confirm deployed API responds at `https://your-backend.onrender.com/api/rooms`.
