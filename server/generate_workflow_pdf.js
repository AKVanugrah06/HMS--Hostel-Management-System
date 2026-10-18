const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../Hostel_Management_System_Workflow_Guide.pdf');
const doc = new PDFDocument({ margin: 50, size: 'A4' });

doc.pipe(fs.createWriteStream(outputPath));

// Colors
const PRIMARY = '#4f46e5';
const SECONDARY = '#0f172a';
const MUTED = '#64748b';
const ACCENT = '#10b981';
const BORDER = '#e2e8f0';

// Helpers
function addHeader(title, subtitle) {
  doc.rect(50, 40, doc.page.width - 100, 70).fill('#f8fafc');
  doc.fillColor(PRIMARY).fontSize(20).font('Helvetica-Bold').text(title, 65, 52);
  doc.fillColor(MUTED).fontSize(10).font('Helvetica').text(subtitle, 65, 78);
  doc.moveDown(2);
}

function addSectionTitle(title) {
  doc.moveDown(0.8);
  doc.fillColor(SECONDARY).fontSize(14).font('Helvetica-Bold').text(title);
  doc.strokeColor(PRIMARY).lineWidth(1.5).moveTo(doc.x, doc.y + 2).lineTo(doc.x + 180, doc.y + 2).stroke();
  doc.moveDown(0.6);
}

function addParagraph(text) {
  doc.fillColor('#334155').fontSize(10).font('Helvetica').text(text, { lineGap: 3, align: 'justify' });
  doc.moveDown(0.5);
}

function addBullet(boldLabel, text) {
  doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold').text('• ' + boldLabel + ': ', { continued: true });
  doc.fillColor('#334155').font('Helvetica').text(text, { lineGap: 2 });
  doc.moveDown(0.3);
}

// ================= PAGE 1 =================
addHeader('HostelFlow — System Workflow Guide', 'Complete Operational Blueprint, Architecture & User Journey');

addSectionTitle('1. Project Overview & Core Vision');
addParagraph(
  'HostelFlow is an end-to-end, paperless Online Hostel Management System (HMS) developed to eliminate physical paperwork, manual office queues, and untracked room allocations. It creates a digital, auditable bridge between college students and hostel wardens.'
);

addSectionTitle('2. Dual-Role Architecture');
addBullet('Student Portal', 'Students register, browse live non-AC rooms across 4 sharing tiers, apply online, receive auto-generated fee challans, pay via the MMMUT Samarth Fee Portal redirect, upload transaction receipts, and track room maintenance tickets.');
addBullet('Warden Control Room', 'Wardens monitor total hostel occupancy, approve/reject student room applications, audit submitted transaction proofs via an in-app viewer, and manage maintenance complaints on a 3-stage Kanban board.');

addSectionTitle('3. Step-by-Step End-to-End Workflow');
addBullet('Step 1: Student Registration & Login', 'Students register with their college email, roll number, course, and year. Authentication uses secure bcrypt password hashing and JWT bearer tokens.');
addBullet('Step 2: Room Inventory Browsing', 'Students filter rooms by sharing category (Single, Double, Triple, 4-Sharing). Live capacity counters prevent overbooking.');
addBullet('Step 3: Room Application', 'Student chooses their preferred tier and clicks Apply. The system strictly enforces a single active application rule.');
addBullet('Step 4: Warden Atomic Approval', 'Warden reviews pending requests in the Applications Queue. On approval, the system executes an atomic database transaction: verifies vacancy (occupied < capacity), locks the seat, assigns the room, and auto-generates a unique payment challan (e.g. HMS2026-1042-xxxx).');
addBullet('Step 5: External Smart Portal Payment', 'Student receives the challan, clicks "Open MMMUT Samarth Fee Portal", completes the institutional payment externally, and submits their transaction ID and proof screenshot.');
addBullet('Step 6: Warden Audit & Confirmation', 'Warden opens the Payment Verification Queue, clicks "View Proof" to inspect the receipt in an in-app modal, and confirms payment. The room status is permanently locked as Verified.');
addBullet('Step 7: Maintenance Desk', 'Students can report electrical, plumbing, or Wi-Fi issues. The warden advances tickets through Pending -> In Progress -> Resolved.');

// ================= PAGE 2 =================
doc.addPage();
addHeader('HostelFlow — Technical Specifications', 'Directory Mapping, Database Schema, and Local Execution');

addSectionTitle('4. Where Everything Lives in the Codebase');
addBullet('client/src/pages/student/', 'Student views: StudentDashboard.jsx, BrowseRooms.jsx, PaymentPage.jsx, MyComplaints.jsx.');
addBullet('client/src/pages/warden/', 'Warden views: WardenDashboard.jsx, ApplicationsQueue.jsx, PaymentVerificationQueue.jsx, ComplaintsManagement.jsx, Analytics.jsx.');
addBullet('client/src/api/', 'Modular Axios client functions matching backend endpoints (auth.api.js, room.api.js, application.api.js, payment.api.js, complaint.api.js).');
addBullet('server/src/controllers/', 'Business logic: application.controller.js (atomic transaction lock), payment.controller.js, auth.controller.js, complaint.controller.js.');
addBullet('server/src/middleware/', 'Security layers: auth.middleware.js (JWT parsing), role.middleware.js (Role guards), upload.middleware.js (Multer file storage).');
addBullet('server/prisma/dev.db', 'SQLite relational database storing Users, Students, Wardens, Rooms, Applications, Payments, and Complaints.');
addBullet('start-all.bat', 'One-click Windows launcher that runs both frontend and backend and launches the browser.');

addSectionTitle('5. Pre-Seeded Demo Credentials');
doc.rect(50, doc.y, doc.page.width - 100, 65).fill('#f1f5f9');
doc.fillColor(SECONDARY).fontSize(10).font('Helvetica-Bold').text('Warden Account:', 65, doc.y + 10);
doc.fillColor('#334155').font('Helvetica').text('Email: warden@hostel.edu    |    Password: WardenPass123!    |    Name: Dr. Alok Verma', 65, doc.y + 2);
doc.moveDown(0.4);
doc.fillColor(SECONDARY).font('Helvetica-Bold').text('Student Account:', 65, doc.y);
doc.fillColor('#334155').font('Helvetica').text('Email: student@college.edu    |    Password: StudentPass123!   |    Name: Rahul Sharma (21BCE1042)', 65, doc.y + 2);
doc.moveDown(2);

addSectionTitle('6. Academic & Viva Presentation Highlights');
addBullet('Why External Portal Redirect?', 'College campuses use centralized ERP fee systems (MMMUT Samarth). Since external apps do not have institutional banking API access, the unique challan redirect model is the industry standard for payment reconciliation.');
addBullet('Double-Booking Prevention', 'Room capacity checks and seat incrementing are encapsulated inside an atomic Prisma $transaction. Race conditions between concurrent applicants are mathematically impossible.');
addBullet('Audit Trail', 'Every administrative action logs staff IDs and timestamps (decidedAt, verifiedAt, resolvedAt).');

doc.moveDown(1.5);
doc.rect(50, doc.y, doc.page.width - 100, 35).fill(PRIMARY);
doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text('HostelFlow — 100% Operational & Verified', 65, doc.y + 12, { align: 'center' });

doc.end();
console.log('✅ Generated PDF at:', outputPath);
