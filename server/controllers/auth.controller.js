import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} from '../utils/generateToken.js';
import { addWelcomeEmailJob, addPasswordResetJob } from '../queues/emailQueue.js';

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    // Queue welcome email (non-blocking)
    addWelcomeEmailJob({ name, email }).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: { user, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token not found' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    if (!user || user.refreshToken !== hashed) {
      return res.status(401).json({ success: false, message: 'Refresh token mismatch' });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    res.json({ success: true, data: { accessToken, user } });
  } catch (err) {
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const hashed = crypto.createHash('sha256').update(token).digest('hex');
      await User.findOneAndUpdate({ refreshToken: hashed }, { refreshToken: null });
    }
    clearRefreshCookie(res);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashed;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    addPasswordResetJob({ name: user.name, email, resetUrl }).catch(console.error);

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    clearRefreshCookie(res);
    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (err) {
    next(err);
  }
};
