import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async ({ name, email }) => {
  await transporter.sendMail({
    from: `"Movie Review" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🎬 Welcome to Movie Review!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h1 style="color:#6366f1">Welcome, ${name}! 🎬</h1>
        <p>We're thrilled to have you on Movie Review — your go-to platform for honest film criticism.</p>
        <p>Start exploring movies, write reviews, and build your watchlist today!</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Browse Movies
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">Movie Review Team</p>
      </div>
    `,
  });
};

/**
 * Send a password reset email
 */
export const sendPasswordResetEmail = async ({ name, email, resetUrl }) => {
  await transporter.sendMail({
    from: `"Movie Review" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '🔐 Password Reset Request',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>Password Reset</h2>
        <p>Hi ${name},</p>
        <p>You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#ef4444;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p style="margin-top:24px;color:#888;font-size:12px">Movie Review Team</p>
      </div>
    `,
  });
};

/**
 * Notify a user about a new review on a movie they follow
 */
export const sendReviewNotificationEmail = async ({ email, movieTitle, reviewerName }) => {
  await transporter.sendMail({
    from: `"Movie Review" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🎬 New review on "${movieTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2>New Review Alert</h2>
        <p><strong>${reviewerName}</strong> just posted a review on <strong>${movieTitle}</strong>.</p>
        <a href="${process.env.CLIENT_URL}/movies" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Read Review
        </a>
        <p style="margin-top:24px;color:#888;font-size:12px">Movie Review Team</p>
      </div>
    `,
  });
};

export default transporter;
