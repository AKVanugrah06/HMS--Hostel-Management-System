const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// Student endpoints
router.post(
  '/',
  authenticate,
  requireRole('student'),
  upload.single('photo'),
  complaintController.createComplaint
);
router.get('/me', authenticate, requireRole('student'), complaintController.getMyComplaints);

// Warden endpoints
router.get('/', authenticate, requireRole('warden', 'super_admin'), complaintController.getAllComplaints);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('warden', 'super_admin'),
  complaintController.updateComplaintStatus
);

module.exports = router;
