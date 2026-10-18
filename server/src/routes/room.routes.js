const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');

router.get('/occupancy-stats', roomController.getOccupancyStats);
router.get('/', roomController.getRooms);
router.get('/:id', roomController.getRoomById);

module.exports = router;
