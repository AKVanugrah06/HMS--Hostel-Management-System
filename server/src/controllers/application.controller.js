const prisma = require('../config/db');
const { generateReferenceNo } = require('../services/reference.service');
const { sendEmail } = require('../services/email.service');

// Student submits room application
async function applyForRoom(req, res, next) {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({ message: 'Only registered students can apply for rooms.' });
    }

    const { preferredSharingType } = req.body;
    if (!preferredSharingType) {
      return res.status(400).json({ message: 'Preferred sharing tier is required.' });
    }

    // Check for active application (pending or approved)
    const existing = await prisma.roomApplication.findFirst({
      where: {
        studentId,
        status: { in: ['pending', 'approved'] },
      },
    });

    if (existing) {
      return res.status(400).json({
        message: 'You already have an active room application in progress.',
        application: existing,
      });
    }

    const application = await prisma.roomApplication.create({
      data: {
        studentId,
        preferredSharingType,
        status: 'pending',
      },
      include: {
        student: true,
      },
    });

    // Notify student
    await sendEmail(
      req.user.email,
      'Hostel Application Received — HostelFlow',
      `<p>Hello ${application.student.fullName},</p><p>Your request for a <strong>${preferredSharingType}</strong> room has been submitted and is currently pending warden approval.</p>`
    );

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
}

// Student views their own application
async function getMyApplication(req, res, next) {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({ message: 'Student profile not associated with this account.' });
    }

    const application = await prisma.roomApplication.findFirst({
      where: { studentId },
      orderBy: { appliedAt: 'desc' },
      include: {
        assignedRoom: true,
        payment: true,
      },
    });

    res.json(application || null);
  } catch (err) {
    next(err);
  }
}

// Warden views all applications
async function getAllApplications(req, res, next) {
  try {
    const { status } = req.query;

    const applications = await prisma.roomApplication.findMany({
      where: {
        ...(status && { status }),
      },
      include: {
        student: {
          include: { user: true },
        },
        assignedRoom: true,
        payment: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json(applications);
  } catch (err) {
    next(err);
  }
}

// Warden approves application (Atomic & Concurrency-Safe)
async function approveApplication(req, res, next) {
  try {
    const { id } = req.params;
    const wardenId = req.user.wardenId;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch application
      const app = await tx.roomApplication.findUnique({
        where: { id },
        include: { student: true },
      });

      if (!app) {
        throw new Error('Application not found.');
      }
      if (app.status !== 'pending') {
        throw new Error(`Cannot approve application with status '${app.status}'.`);
      }

      // 2. Find available candidate room of the requested type
      const candidateRooms = await tx.room.findMany({
        where: {
          sharingType: app.preferredSharingType,
          status: 'available',
        },
        orderBy: { roomNo: 'asc' },
      });

      const availableRoom = candidateRooms.find((r) => r.occupiedCount < r.capacity);

      if (!availableRoom) {
        throw new Error(`No capacity available for sharing tier '${app.preferredSharingType}'.`);
      }

      // 3. Increment room occupancy & update status if full
      const newOccupiedCount = availableRoom.occupiedCount + 1;
      const updatedRoom = await tx.room.update({
        where: { id: availableRoom.id },
        data: {
          occupiedCount: newOccupiedCount,
          status: newOccupiedCount >= availableRoom.capacity ? 'full' : 'available',
        },
      });

      // 4. Update application status
      const updatedApp = await tx.roomApplication.update({
        where: { id },
        data: {
          status: 'approved',
          assignedRoomId: availableRoom.id,
          decidedBy: wardenId,
          decidedAt: new Date(),
        },
      });

      // 5. Generate unique challan reference and auto-create payment record
      const referenceNo = generateReferenceNo(app.studentId, app.student.rollNo);
      const payment = await tx.payment.create({
        data: {
          studentId: app.studentId,
          applicationId: app.id,
          amountDue: availableRoom.feePerHead,
          referenceNo,
          status: 'pending',
        },
      });

      return { updatedApp, updatedRoom, payment, student: app.student };
    });

    // Notify student of room allocation and fee payment details
    const studentUser = await prisma.user.findUnique({ where: { id: result.student.userId } });
    if (studentUser) {
      await sendEmail(
        studentUser.email,
        'Hostel Room Allocated — Fee Payment Required',
        `<p>Congratulations ${result.student.fullName}!</p>
         <p>You have been assigned Room <strong>${result.updatedRoom.roomNo} (${result.updatedRoom.block})</strong>.</p>
         <p>Your fee challan reference number is <strong>${result.payment.referenceNo}</strong> for ₹${result.payment.amountDue}.</p>
         <p>Please log into your dashboard to pay on the college Smart Portal and submit your transaction ID.</p>`
      );
    }

    res.json({
      message: 'Application approved successfully.',
      application: result.updatedApp,
      room: result.updatedRoom,
      payment: result.payment,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Warden rejects application
async function rejectApplication(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const wardenId = req.user.wardenId;

    const app = await prisma.roomApplication.findUnique({
      where: { id },
      include: { student: { include: { user: true } } },
    });

    if (!app) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const updatedApp = await prisma.roomApplication.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason || 'Application declined by warden office.',
        decidedBy: wardenId,
        decidedAt: new Date(),
      },
    });

    if (app.student?.user?.email) {
      await sendEmail(
        app.student.user.email,
        'Hostel Application Status Update',
        `<p>Dear ${app.student.fullName},</p><p>Your room application has been rejected. Reason: ${reason || 'Capacity full or non-eligible'}.</p>`
      );
    }

    res.json({ message: 'Application rejected.', application: updatedApp });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  applyForRoom,
  getMyApplication,
  getAllApplications,
  approveApplication,
  rejectApplication,
};
