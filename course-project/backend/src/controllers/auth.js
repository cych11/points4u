"use strict";
const { AuthService, AuthError } = require("../services/auth");

const RESET_RATE_LIMIT_MS = 60 * 1000;
const recentResetRequests = new Map();
const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:mail\.)?utoronto\.ca$/i;
const utoridRegex = /^[a-zA-Z0-9]{7,8}$/;

const allowedFields = (payload, allowed) => Object.keys(payload).filter((key) => !allowed.includes(key));

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const isValidPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  password.length <= 20 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const authenticateUserController = async (req, res) => {
  try {
    const { utorid, password } = req.body ?? {};
    if (typeof utorid !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: "Missing credentials." });
    }
    const result = await AuthService.login(utorid.trim(), password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const passwordResetRequestController = async (req, res) => {
  const payload = req.body ?? {};
  const extraFields = allowedFields(payload, ['utorid']);
  if (extraFields.length) {
    return res.status(400).json({ message: `Unknown field(s): ${extraFields.join(', ')}` });
  }

  if (typeof payload.utorid !== 'string' || !payload.utorid.trim()) {
    return res.status(400).json({ message: "Utorid is required" });
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const lastSuccess = recentResetRequests.get(ip);
  if (lastSuccess && now - lastSuccess < RESET_RATE_LIMIT_MS) {
    return res.status(429).json({ message: "Too many requests." });
  }

  try {
    const result = await AuthService.createResetRequest(payload.utorid.trim());
    recentResetRequests.set(ip, now);
    return res.status(202).json(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const resetPasswordController = async (req, res) => {
  const payload = req.body ?? {};
  const extraFields = allowedFields(payload, ['utorid', 'password']);
  if (extraFields.length) {
    return res.status(400).json({ message: `Unknown field(s): ${extraFields.join(', ')}` });
  }

  if (typeof payload.utorid !== 'string' || !payload.utorid.trim()) {
    return res.status(400).json({ message: "Utorid is required" });
  }

  if (typeof payload.password !== 'string') {
    return res.status(400).json({ message: "Password is required" });
  }

  if (!isValidPassword(payload.password)) {
    return res.status(400).json({ message: "Invalid password." });
  }

  try {
    await AuthService.updatePassword(payload.utorid.trim(), payload.password, req.params.resetToken);
    res.status(200).json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

const registerController = async (req, res) => {
  const payload = req.body ?? {};
  const { utorid, name, email, password } = payload;

  // Validate required fields
  if (!utorid || !name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  if (typeof utorid !== 'string' || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: "Invalid request body." });
  }

  // Validate utorid format (7-8 alphanumeric)
  if (!utoridRegex.test(utorid.trim())) {
    return res.status(400).json({ message: "Utorid must be 7-8 alphanumeric characters." });
  }

  // Validate name length
  if (name.trim().length < 1 || name.trim().length > 50) {
    return res.status(400).json({ message: "Name must be between 1 and 50 characters." });
  }

  // Validate email format (must be @utoronto.ca)
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: "Email must be a valid University of Toronto email." });
  }

  // Validate password
  if (!isValidPassword(password)) {
    return res.status(400).json({ message: "Invalid password. Password must be 8-20 characters and contain uppercase, lowercase, number, and special character." });
  }

  try {
    const user = await AuthService.register(utorid.trim(), name.trim(), email.trim(), password);
    return res.status(201).json({ message: "Registration successful", user });
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { authenticateUserController, resetPasswordController, passwordResetRequestController, registerController };
