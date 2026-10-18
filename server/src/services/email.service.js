const nodemailer = require('nodemailer');

let transporter = null;
if (
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.SMTP_USER !== 'your_email@gmail.com'
) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail(to, subject, html) {
  try {
    if (transporter) {
      await transporter.sendMail({
        from: `"HostelFlow Administration" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`📧 Real email delivered to ${to}: "${subject}"`);
    } else {
      console.log(`📧 [Email Simulation] To: ${to} | Subject: "${subject}"`);
    }
  } catch (err) {
    console.error(`⚠️ Email dispatch warning (${to}):`, err.message);
  }
}

module.exports = { sendEmail };
