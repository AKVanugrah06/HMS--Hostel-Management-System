const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../services/email.service');

// Student Registration
async function register(req, res, next) {
  try {
    const {
      email,
      password,
      fullName,
      rollNo,
      course,
      year,
      phone,
      emergencyContact,
    } = req.body;

    if (!email || !password || !fullName || !rollNo) {
      return res.status(400).json({ message: 'Missing mandatory registration fields.' });
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this college email already exists.' });
    }

    // Check existing rollNo
    const existingStudent = await prisma.student.findUnique({ where: { rollNo: rollNo.toUpperCase() } });
    if (existingStudent) {
      return res.status(400).json({ message: 'A student with this roll number has already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: 'student',
        isVerified: true, // Set to true for smooth immediate demo, token saved for OTP check
        verificationToken: verificationOtp,
        student: {
          create: {
            fullName,
            rollNo: rollNo.toUpperCase(),
            course: course || 'General',
            year: parseInt(year || 1, 10),
            phone: phone || '',
            emergencyContact: emergencyContact || '',
          },
        },
      },
      include: {
        student: true,
      },
    });

    // Send notification email
    await sendEmail(
      newUser.email,
      'Welcome to HostelFlow — Account Verification',
      `<p>Hello ${fullName},</p><p>Your hostel portal account has been created. Your verification code is: <strong>${verificationOtp}</strong></p>`
    );

    const token = generateToken({ id: newUser.id, role: newUser.role });

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        studentProfile: newUser.student,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Verify Email
async function verifyEmail(req, res, next) {
  try {
    const { email, token } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    if (token && user.verificationToken && user.verificationToken !== token) {
      return res.status(400).json({ message: 'Invalid verification token/OTP.' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null },
    });

    res.json({ message: 'Email successfully verified.', isVerified: updated.isVerified });
  } catch (err) {
    next(err);
  }
}

// Login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        student: true,
        warden: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        studentProfile: user.student,
        wardenProfile: user.warden,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Forgot Password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user) {
      const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: resetOtp, resetPasswordExpires: expires },
      });

      await sendEmail(
        user.email,
        'HostelFlow — Password Reset Request',
        `<p>Your password reset code is: <strong>${resetOtp}</strong>. Valid for 1 hour.</p>`
      );
    }

    res.json({ message: 'If this email is registered, password reset instructions have been sent.' });
  } catch (err) {
    next(err);
  }
}

// Reset Password
async function resetPassword(req, res, next) {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, reset token, and new password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (
      !user ||
      user.resetPasswordToken !== token ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

// Get Current User Profile
async function getMe(req, res, next) {
  try {
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
        studentProfile: req.user.studentProfile,
        wardenProfile: req.user.wardenProfile,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  getMe,
};
