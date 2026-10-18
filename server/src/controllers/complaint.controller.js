const prisma = require('../config/db');
const { sendEmail } = require('../services/email.service');

// Student files a new maintenance complaint
async function createComplaint(req, res, next) {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({ message: 'Student profile required.' });
    }

    const { category, description } = req.body;
    if (!category || !description) {
      return res.status(400).json({ message: 'Category and description are required.' });
    }

    // Attempt to locate student's assigned room
    const approvedApp = await prisma.roomApplication.findFirst({
      where: { studentId, status: 'approved' },
      select: { assignedRoomId: true },
    });

    const photoUrl = req.file ? `/uploads/complaints/${req.file.filename}` : null;

    const complaint = await prisma.complaint.create({
      data: {
        studentId,
        roomId: approvedApp?.assignedRoomId || null,
        category,
        description,
        photoUrl,
        status: 'pending',
      },
      include: {
        student: true,
        room: true,
      },
    });

    res.status(201).json({
      message: 'Maintenance ticket registered.',
      complaint,
    });
  } catch (err) {
    next(err);
  }
}

// Student views their own complaints
async function getMyComplaints(req, res, next) {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({ message: 'Student profile required.' });
    }

    const complaints = await prisma.complaint.findMany({
      where: { studentId },
      include: { room: true },
      orderBy: { raisedAt: 'desc' },
    });

    res.json(complaints);
  } catch (err) {
    next(err);
  }
}

// Warden views all complaints
async function getAllComplaints(req, res, next) {
  try {
    const { status, category } = req.query;

    const complaints = await prisma.complaint.findMany({
      where: {
        ...(status && { status }),
        ...(category && { category }),
      },
      include: {
        student: { include: { user: true } },
        room: true,
      },
      orderBy: { raisedAt: 'desc' },
    });

    res.json(complaints);
  } catch (err) {
    next(err);
  }
}

// Warden updates complaint status (e.g., in_progress, resolved)
async function updateComplaintStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const wardenId = req.user.wardenId;

    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'pending', 'in_progress', or 'resolved'." });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { student: { include: { user: true } } },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint ticket not found.' });
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        handledBy: wardenId,
        resolvedAt: status === 'resolved' ? new Date() : null,
      },
    });

    // Notify student of ticket status advancement
    if (complaint.student?.user?.email) {
      await sendEmail(
        complaint.student.user.email,
        `Hostel Maintenance Update — [${status.replace('_', ' ').toUpperCase()}]`,
        `<p>Hello ${complaint.student.fullName},</p>
         <p>Your maintenance ticket regarding <strong>${complaint.category}</strong> has been updated to: <strong>${status.replace('_', ' ').toUpperCase()}</strong>.</p>`
      );
    }

    res.json({
      message: `Complaint ticket marked as '${status}'.`,
      complaint: updatedComplaint,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
};
