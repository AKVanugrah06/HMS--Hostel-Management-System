const prisma = require('../config/db');
const { sendEmail } = require('../services/email.service');

// Student fetches their payment record
async function getMyPayment(req, res, next) {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({ message: 'Student profile required.' });
    }

    const payment = await prisma.payment.findFirst({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      include: {
        application: {
          include: {
            assignedRoom: true,
          },
        },
      },
    });

    res.json(payment || null);
  } catch (err) {
    next(err);
  }
}

// Student submits external Smart Portal transaction ID and receipt
async function submitPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { portalTransactionId } = req.body;
    const studentId = req.user.studentId;

    if (!portalTransactionId) {
      return res.status(400).json({ message: 'Portal Transaction ID is mandatory.' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { student: { include: { user: true } } },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment challan record not found.' });
    }
    if (payment.studentId !== studentId) {
      return res.status(403).json({ message: 'Unauthorized: this payment belongs to another student.' });
    }

    const receiptUrl = req.file ? `/uploads/receipts/${req.file.filename}` : payment.receiptUploadUrl;

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        portalTransactionId,
        receiptUploadUrl: receiptUrl,
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    // Notify student
    if (payment.student?.user?.email) {
      await sendEmail(
        payment.student.user.email,
        'Payment Details Received — Under Verification',
        `<p>Hello ${payment.student.fullName},</p>
         <p>Your payment details (Txn ID: <strong>${portalTransactionId}</strong>) have been submitted to the warden office for audit.</p>`
      );
    }

    res.json({
      message: 'Payment details submitted for warden verification.',
      payment: updatedPayment,
    });
  } catch (err) {
    next(err);
  }
}

// Warden views payment verification queue
async function getPendingPayments(req, res, next) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: { in: ['submitted', 'pending'] },
      },
      include: {
        student: true,
        application: {
          include: { assignedRoom: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json(payments);
  } catch (err) {
    next(err);
  }
}

// Warden verifies or rejects submitted payment
async function verifyPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // 'verified' or 'rejected'
    const wardenId = req.user.wardenId;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'verified' or 'rejected'." });
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
        application: { include: { assignedRoom: true } },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found.' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        verifiedBy: wardenId,
        verifiedAt: new Date(),
        notes: notes || null,
      },
    });

    // Notify student
    if (payment.student?.user?.email) {
      if (status === 'verified') {
        await sendEmail(
          payment.student.user.email,
          'Hostel Room Booking Confirmed! — Payment Verified',
          `<p>Great news, ${payment.student.fullName}!</p>
           <p>Your hostel fee payment has been verified by the warden. Your room booking for <strong>Room ${payment.application?.assignedRoom?.roomNo || ''}</strong> is now 100% confirmed!</p>`
        );
      } else {
        await sendEmail(
          payment.student.user.email,
          'Payment Discrepancy — Action Required',
          `<p>Dear ${payment.student.fullName},</p>
           <p>Your payment verification could not be approved by the warden. Please verify your transaction receipt and re-submit the correct details.</p>`
        );
      }
    }

    res.json({
      message: `Payment status updated to '${status}'.`,
      payment: updatedPayment,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyPayment,
  submitPayment,
  getPendingPayments,
  verifyPayment,
};
