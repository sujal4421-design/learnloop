// src/services/emailService.js
// Sends emails via Nodemailer. Like AIService, this is intentionally
// isolated — it knows nothing about cron jobs or how revisions are queried,
// just "send this email to this address."

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for port 465, false for 587 (STARTTLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return transporter;
}

const EmailService = {
  async sendRevisionReminder(user, dueRevisions) {
    const mailer = getTransporter();
    if (!mailer) {
      console.warn('Email credentials not set — skipping reminder email.');
      return false;
    }

    const listHtml = dueRevisions
      .map(r => `<li><strong>${r.title}</strong> <span style="color:#6B6B68;">(${r.category})</span></li>`)
      .join('');

    try {
      await mailer.sendMail({
        from: `"LearnLoop" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `You have ${dueRevisions.length} topic${dueRevisions.length > 1 ? 's' : ''} to revise today`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #2F6F4E;">Good morning, ${user.name}! 👋</h2>
            <p>Here's what's due for revision today:</p>
            <ul>${listHtml}</ul>
            <p><a href="${process.env.APP_URL || 'http://localhost:3000'}/revisions" style="color: #2F6F4E; font-weight: 600;">Open LearnLoop →</a></p>
          </div>
        `
      });
      return true;
    } catch (err) {
      console.error(`Failed to send reminder email to ${user.email}:`, err.message);
      return false;
    }
  }
};

module.exports = EmailService;
