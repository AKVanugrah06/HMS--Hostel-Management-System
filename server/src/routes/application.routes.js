const express = require('express');
const router = express.Router();
const appController = require('../controllers/application.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

// Student endpoints
router.post('/', authenticate, requireRole('student'), appController.applyForRoom);
router.get('/me', authenticate, requireRole('student'), appController.getMyApplication);

// Warden endpoints
router.get('/', authenticate, requireRole('warden', 'super_admin'), appController.getAllApplications);
router.patch('/:id/approve', authenticate, requireRole('warden', 'super_admin'), appController.approveApplication);
router.patch('/:id/reject', authenticate, requireRole('warden', 'super_admin'), appController.rejectApplication);

module.exports = router;
