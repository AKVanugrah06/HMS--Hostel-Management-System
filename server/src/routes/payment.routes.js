const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// Student endpoints
router.get('/me', authenticate, requireRole('student'), paymentController.getMyPayment);
router.post(
  '/:id/submit',
  authenticate,
  requireRole('student'),
  upload.single('receipt'),
  paymentController.submitPayment
);

// Warden endpoints
router.get(
  '/pending-verification',
  authenticate,
  requireRole('warden', 'super_admin'),
  paymentController.getPendingPayments
);
router.patch(
  '/:id/verify',
  authenticate,
  requireRole('warden', 'super_admin'),
  paymentController.verifyPayment
);

module.exports = router;
