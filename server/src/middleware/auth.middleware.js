const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecret_jwt_key_hostel_management_2026'
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        student: true,
        warden: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User account not found or has been deactivated.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      studentId: user.student?.id || null,
      wardenId: user.warden?.id || null,
      studentProfile: user.student,
      wardenProfile: user.warden,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
}

module.exports = authenticate;
