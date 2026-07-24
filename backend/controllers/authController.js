import crypto from "crypto";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";

// @route POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      name,
      email,
      password,
      emailVerifyToken,
    });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens = [refreshToken];
    user.deviceHistory.push({
      device: req.headers["user-agent"] || "unknown",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({
      success: true,
      message: "Registered successfully",
      user: user.toSafeObject(),
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password +refreshTokens");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
    user.deviceHistory.push({
      device: req.headers["user-agent"] || "unknown",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    user.deviceHistory = user.deviceHistory.slice(-10);

    // streak logic
    const today = new Date().toDateString();
    const last = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null;
    if (last !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      user.streak = last === yesterday.toDateString() ? user.streak + 1 : 1;
      user.lastStudyDate = new Date();
    }

    await user.save();

    setAuthCookies(res, accessToken, refreshToken);
    res.json({
      success: true,
      message: "Logged in successfully",
      user: user.toSafeObject(),
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshTokens");
    if (!user || !user.refreshTokens.includes(token)) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setAuthCookies(res, newAccessToken, newRefreshToken);
    res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    clearAuthCookies(res);
    res.status(401).json({ success: false, message: "Session expired, please log in again" });
  }
};

// @route POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select("+refreshTokens");
        if (user) {
          user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
          await user.save();
        }
      } catch (_) {}
    }
    clearAuthCookies(res);
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
};

// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    // Always respond success to avoid email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: "If that email exists, a reset link has been generated.",
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1hr
    await user.save();

    // NOTE: No email provider configured in v1 (free-tier scope).
    // In production wire this to an email service (e.g. free tier of Resend/Brevo).
    res.json({
      success: true,
      message: "Reset token generated. (Email sending not configured in v1 — token returned for dev use only.)",
      devResetToken: process.env.NODE_ENV !== "production" ? resetToken : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    res.json({ success: true, message: "Password reset successful. Please log in." });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ emailVerifyToken: req.params.token }).select("+emailVerifyToken");
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid verification token" });
    }
    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    await user.save();
    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/sessions
export const getSessions = async (req, res) => {
  res.json({ success: true, sessions: req.user.deviceHistory });
};
