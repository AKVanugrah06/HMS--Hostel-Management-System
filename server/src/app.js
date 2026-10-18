const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/room.routes');
const applicationRoutes = require('./routes/application.routes');
const paymentRoutes = require('./routes/payment.routes');
const complaintRoutes = require('./routes/complaint.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Hostel Management System API',
    timestamp: new Date().toISOString(),
  });
});

// Mount modules
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

module.exports = app;
