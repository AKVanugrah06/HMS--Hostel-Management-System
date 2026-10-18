const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../Hostel_Management_System_Workflow_Guide.pdf');
const doc = new PDFDocument({ margin: 40, size: 'A4' });

doc.pipe(fs.createWriteStream(outputPath));

// Colors
const PRIMARY = '#4f46e5';
const SECONDARY = '#0f172a';
const MUTED = '#64748b';
const BG_LIGHT = '#f8fafc';
const CARD_BG = '#f1f5f9';
const BORDER = '#cbd5e1';
const GREEN = '#059669';
const AMBER = '#d97706';

function drawBanner(title, subtitle) {
  doc.rect(40, 35, doc.page.width - 80, 65).fill(PRIMARY);
  doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text(title, 55, 48);
  doc.fillColor('#e0e7ff').fontSize(10).font('Helvetica').text(subtitle, 55, 74);
  doc.y = 115;
}

function drawSection(title) {
  doc.moveDown(0.6);
  doc.fillColor(SECONDARY).fontSize(13).font('Helvetica-Bold').text(title);
  doc.strokeColor(PRIMARY).lineWidth(1.5).moveTo(doc.x, doc.y + 2).lineTo(doc.x + 220, doc.y + 2).stroke();
  doc.moveDown(0.5);
}

function drawStepCard(partTitle, stepTitle, instructions, notes = null) {
  const cardY = doc.y;
  doc.rect(40, cardY, doc.page.width - 80, 52).fill(CARD_BG);
  doc.strokeColor(BORDER).lineWidth(0.8).rect(40, cardY, doc.page.width - 80, 52).stroke();

  doc.fillColor(PRIMARY).fontSize(9).font('Helvetica-Bold').text(partTitle.toUpperCase(), 52, cardY + 8);
  doc.fillColor(SECONDARY).fontSize(11).font('Helvetica-Bold').text(stepTitle, 52, cardY + 20);
  doc.fillColor('#334155').fontSize(9).font('Helvetica').text(instructions, 52, cardY + 34, { width: doc.page.width - 110 });

  doc.y = cardY + 58;
}

function drawBullet(title, desc) {
  doc.fillColor(PRIMARY).fontSize(9.5).font('Helvetica-Bold').text('• ' + title + ': ', { continued: true });
  doc.fillColor('#334155').font('Helvetica').text(desc, { lineGap: 2 });
  doc.moveDown(0.25);
}

// ================= PAGE 1 =================
drawBanner('HostelFlow — End-to-End Walkthrough Guide', 'Official Step-by-Step Testing & System Demonstration Manual');

doc.rect(40, doc.y, doc.page.width - 80, 50).fill('#eef2ff');
doc.strokeColor('#c7d2fe').lineWidth(1).rect(40, doc.y, doc.page.width - 80, 50).stroke();
doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold').text('🚀 Ready to Run & Test on Your System!', 55, doc.y + 8);
doc.fillColor('#312e81').fontSize(9).font('Helvetica').text('Frontend Web App: http://localhost:5173    |    Backend API: http://localhost:5000', 55, doc.y + 4);
doc.fillColor('#4338ca').fontSize(8.5).font('Helvetica-Oblique').text('Launch with one click using "start-all.bat" in the root directory.', 55, doc.y + 4);
doc.y += 24;

drawSection('Part 1: The Student Experience');

drawBullet('1. Login & Autofill', 'Open http://localhost:5173/login. Click the "Student" autofill card (or use student@college.edu / StudentPass123!), then click "Sign In to Dashboard".');

drawBullet('2. Browse & Apply for a Room', 'Click "Browse Rooms" in the sidebar. Filter by sharing tier (Single, Double, Triple, 4-Sharing). Click "Apply For Tier" on your preferred room. Notice the real-time toast confirmation and the status banner indicating your application is pending review.');

drawBullet('3. Check Maintenance Desk', 'Go to "My Complaints" -> Click "Raise New Complaint". Pick an issue category (Electrical, Plumbing, Wi-Fi, Furniture), enter a brief description, attach an optional screenshot, and submit.');

drawSection('Part 2: The Warden Control Room');

drawBullet('1. Switch to Warden Account', 'Click the Logout button in the top navbar. On the login page, click the "Warden Admin" autofill card (warden@hostel.edu / WardenPass123!) and sign in.');

drawBullet('2. Review & Approve Room Application', 'Go to "Applications Queue". Locate the student\'s pending request and click "Approve". The system executes an atomic transaction (checks capacity -> locks bed -> assigns room -> auto-generates payment reference HMS2026-STUxxxx).');

drawBullet('3. Inspect Visual Occupancy Grid', 'Go to "Overview" (Dashboard). View the live Block & Floor room matrix (Green = Available, Red = Full) updating automatically.');

drawBullet('4. Triage Maintenance Tickets', 'Go to "Complaints Board" (Kanban). Click "Dispatch Technician" to advance ticket to In Progress, then click "Mark Resolved".');

drawSection('Part 3: Completing the External Payment Flow');

drawBullet('1. Switch Back to Student View', 'Logout and log back in as Student. Open "Fee Payment" from the sidebar.');

drawBullet('2. View Reference & Pay on Smart Portal', 'See your newly assigned room and unique Challan Reference ID. Click "Open MMMUT Samarth Fee Portal" (redirects externally to pay).');

drawBullet('3. Submit Transaction ID & Receipt', 'Under Step 2, enter your bank/portal Transaction ID (e.g., TXN98421038), optionally attach an image/PDF receipt, and click "Submit Transaction Details".');

drawBullet('4. Warden Verification & Room Confirmation', 'Switch to Warden -> "Verify Payments". Click "View Proof" to audit the student\'s details and receipt in the interactive modal. Click "Confirm" to lock the room booking into the Verified state!');

// ================= PAGE 2 =================
doc.addPage();
drawBanner('HostelFlow — Architecture & Codebase Map', 'Where Every Component, Model, and Service Lives');

drawSection('1. Codebase Directory Mapping');
drawBullet('start-all.bat', 'Root launcher script. Double-click anytime to launch both backend and frontend and open the browser.');
drawBullet('client/src/pages/student/', 'Student views: StudentDashboard.jsx, BrowseRooms.jsx, PaymentPage.jsx, MyComplaints.jsx.');
drawBullet('client/src/pages/warden/', 'Warden views: WardenDashboard.jsx, ApplicationsQueue.jsx, PaymentVerificationQueue.jsx, ComplaintsManagement.jsx, Analytics.jsx.');
drawBullet('client/src/components/common/', 'Shared UI: Navbar.jsx, Sidebar.jsx, Modal.jsx (proof auditor), StatusBadge.jsx, Loader.jsx, ProtectedRoute.jsx.');
drawBullet('client/src/api/', 'Axios API services: auth.api.js, room.api.js, application.api.js, payment.api.js, complaint.api.js.');
drawBullet('server/src/controllers/', 'Business logic: application.controller.js (atomic transaction lock), payment.controller.js, auth.controller.js, complaint.controller.js.');
drawBullet('server/src/middleware/', 'Security: auth.middleware.js (JWT parsing), role.middleware.js (Role guards), upload.middleware.js (Multer file storage).');
drawBullet('server/prisma/dev.db', 'SQLite database storing all seeded Users, Students, Wardens, Rooms, Applications, Payments, and Complaints.');
drawBullet('server/uploads/', 'Local storage directory storing uploaded receipts and complaint photos.');

drawSection('2. Pre-Seeded Demo Credentials');
doc.rect(40, doc.y, doc.page.width - 80, 58).fill(CARD_BG);
doc.strokeColor(BORDER).rect(40, doc.y, doc.page.width - 80, 58).stroke();
doc.fillColor(SECONDARY).fontSize(9.5).font('Helvetica-Bold').text('Warden Admin Account:', 52, doc.y + 8);
doc.fillColor('#334155').font('Helvetica').text('Email: warden@hostel.edu    |    Password: WardenPass123!    |    Name: Dr. Alok Verma', 52, doc.y + 2);
doc.moveDown(0.3);
doc.fillColor(SECONDARY).font('Helvetica-Bold').text('Student Account:', 52, doc.y);
doc.fillColor('#334155').font('Helvetica').text('Email: student@college.edu    |    Password: StudentPass123!   |    Name: Rahul Sharma (21BCE1042)', 52, doc.y + 2);
doc.y += 18;

drawSection('3. Key Project Architecture Decisions');
drawBullet('MMMUT Samarth Portal Integration', 'College portals do not offer third-party payment APIs to student projects. The internal reference challan redirect pattern is the authentic, real-world mechanism for institutional fee reconciliation.');
drawBullet('Atomic Concurrency Safety', 'Room capacity verification and bed counters are executed within Prisma $transaction blocks, completely preventing double-booking race conditions.');
drawBullet('Audit Trail', 'Every administrative decision records timestamps and staff identifiers for complete operational transparency.');

doc.moveDown(1.2);
doc.rect(40, doc.y, doc.page.width - 80, 32).fill(PRIMARY);
doc.fillColor('#ffffff').fontSize(10.5).font('Helvetica-Bold').text('HostelFlow — Online Hostel Management System (HMS) • Verified', 50, doc.y + 11, { align: 'center' });

doc.end();
console.log('✅ Generated updated PDF at:', outputPath);
