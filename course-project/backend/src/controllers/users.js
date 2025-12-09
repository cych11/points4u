"use strict";
const fs = require('fs');
const path = require('path');
const { UserService } = require('../services/users');

const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:mail\.)?utoronto\.ca$/i;
const utoridRegex = /^[a-zA-Z0-9]{7,8}$/;

const ensureRole = (role, allowedRoles) => allowedRoles.includes(role);

const buildUserResponse = (user, promotions = []) => ({
  ...user,
  promotions
});

const validateBooleanQuery = (value) => {
  if (value === undefined) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
};

const createUserController = async (req, res) => {
  try {
    if (!ensureRole(req.user.role, ['cashier', 'manager', 'superuser'])) {
      return res.status(403).json({ message: "Insufficient permission to preform this action." });
    }

    const { utorid, name, email } = req.body ?? {};
    if (!utorid || !name || !email) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (typeof utorid !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ message: "Invalid request body." });
    }
    if (!utoridRegex.test(utorid)) {
      return res.status(400).json({ message: "Utorid must be 7-8 alphanumeric characters." });
    }
    if (name.trim().length < 1 || name.trim().length > 50) {
      return res.status(400).json({ message: "Name must be between 1 and 50 characters." });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email must be a valid University of Toronto email." });
    }

    try {
      const user = await UserService.createUser({ utorid: utorid.trim(), name: name.trim(), email: email.trim().toLowerCase() });
      return res.status(201).json(user);
    } catch (error) {
      if (error.status === 409) {
        return res.status(409).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const listUsersController = async (req, res) => {
  if (!ensureRole(req.user.role, ['manager', 'superuser'])) {
    return res.status(403).json({ message: "Insufficient permission to preform this action." });
  }

  const { name, role, verified, activated, page = '1', limit = '10' } = req.query;
  const parsedVerified = validateBooleanQuery(verified);
  const parsedActivated = validateBooleanQuery(activated);
  if (parsedVerified === null || parsedActivated === null) {
    return res.status(400).json({ message: "Boolean filters must be 'true' or 'false'." });
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  if (!Number.isInteger(pageNum) || pageNum <= 0) {
    return res.status(400).json({ message: "Page must be greater than 0." });
  }
  if (!Number.isInteger(limitNum) || limitNum <= 0 || limitNum > 50) {
    return res.status(400).json({ message: "Limit must be between 1 and 50." });
  }

  if (role && !['regular', 'cashier', 'manager', 'superuser'].includes(role)) {
    return res.status(400).json({ message: "Invalid role filter." });
  }

  try {
    const result = await UserService.listUsers({
      name: name?.trim(),
      role,
      verified: parsedVerified,
      activated: parsedActivated,
      page: pageNum,
      limit: limitNum
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserByIdController = async (req, res) => {
  if (!ensureRole(req.user.role, ['cashier', 'manager', 'superuser'])) {
    return res.status(403).json({ message: "Insufficient permission to preform this action." });
  }
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user id." });
  }
  try {
    const userRecord = await UserService.findById(userId);
    if (!userRecord) {
      return res.status(404).json({ message: "User not found." });
    }
    const promotions = await UserService.getAvailablePromotions(userRecord.utorid);
    const serialized = {
      id: userRecord.id,
      utorid: userRecord.utorid,
      name: userRecord.name,
      points: userRecord.points,
      suspicious: userRecord.suspicious,
      verified: userRecord.verified
    };
    if (ensureRole(req.user.role, ['manager', 'superuser'])) {
      serialized.email = userRecord.email;
      serialized.birthday = userRecord.birthday ? userRecord.birthday.toISOString().split('T')[0] : null;
      serialized.role = userRecord.role;
      serialized.createdAt = userRecord.createdAt?.toISOString() ?? null;
      serialized.lastLogin = userRecord.lastLogin?.toISOString() ?? null;
      serialized.avatarUrl = userRecord.avatarUrl;
    }
    return res.status(200).json(buildUserResponse(serialized, promotions));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateSelfController = async (req, res) => {
  try {
    const updates = {};
    if (req.body?.name !== undefined && req.body.name !== null) {
      if (typeof req.body.name !== 'string' || req.body.name.trim().length === 0 || req.body.name.trim().length > 50) {
        return res.status(400).json({ message: "Name must be between 1 and 50 characters." });
      }
      updates.name = req.body.name.trim();
    }
    if (req.body?.email !== undefined && req.body.email !== null) {
      if (typeof req.body.email !== 'string' || !emailRegex.test(req.body.email.trim())) {
        return res.status(400).json({ message: "Email must be a valid University of Toronto email." });
      }
      updates.email = req.body.email.trim().toLowerCase();
    }
    if (req.body?.birthday !== undefined && req.body.birthday !== null) {
      if (typeof req.body.birthday !== 'string') {
        return res.status(400).json({ message: "Invalid birthday format" });
      }
      const trimmedBirthday = req.body.birthday.trim();
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoDateRegex.test(trimmedBirthday)) {
        return res.status(400).json({ message: "Invalid birthday format" });
      }
      const [year, month, day] = trimmedBirthday.split('-').map(Number);
      const birthdayDate = new Date(`${trimmedBirthday}T00:00:00.000Z`);
      const isValidDate =
        !Number.isNaN(birthdayDate.getTime()) &&
        birthdayDate.getUTCFullYear() === year &&
        birthdayDate.getUTCMonth() + 1 === month &&
        birthdayDate.getUTCDate() === day;
      if (!isValidDate) {
        return res.status(400).json({ message: "Invalid birthday" });
      }
      updates.birthday = birthdayDate;
    }

    if (req.file) {
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: "Avatar must be an image." });
      }
      const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
      fs.mkdirSync(avatarDir, { recursive: true });
      const extension = req.file.originalname?.split('.').pop() || 'png';
      const filename = `${req.user.utorid}.${extension}`;
      const filePath = path.join(avatarDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      updates.avatarUrl = `/uploads/avatars/${filename}`;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "At least one field must be provided." });
    }

    try {
      const updated = await UserService.updateSelf(req.user.utorid, updates);
      const promotions = await UserService.getAvailablePromotions(req.user.utorid);
      return res.status(200).json(buildUserResponse(updated, promotions));
    } catch (error) {
      if (error.status === 409) {
        return res.status(409).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSelfController = async (req, res) => {
  try {
    const user = await UserService.getSelf(req.user.utorid);
    const promotions = await UserService.getAvailablePromotions(req.user.utorid);
    return res.status(200).json(buildUserResponse(user, promotions));
  } catch (error) {
    if (error.message === "Not Found") {
      return res.status(404).json({ message: "User not found." });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateOwnPasswordController = async (req, res) => {
  const { old, new: newPassword } = req.body ?? {};
  if (typeof old !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ message: "Invalid request body." });
  }
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
  if (!strongPassword.test(newPassword)) {
    return res.status(400).json({ message: "Password does not meet complexity requirements." });
  }
  try {
    await UserService.updateOwnPassword(req.user.utorid, old, newPassword);
    return res.status(200).json({ success: true });
  } catch (error) {
    if (error.message === "Forbidden") {
      return res.status(403).json({ message: "Incorrect password." });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserController = async (req, res) => {
  if (!ensureRole(req.user.role, ['manager', 'superuser'])) {
    return res.status(403).json({ message: "Insufficient permission to preform this action." });
  }
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Invalid user id." });
  }
  const { email, verified, suspicious, role } = req.body ?? {};
  const hasEmail = email !== undefined && email !== null;
  const hasVerified = verified !== undefined && verified !== null;
  const hasSuspicious = suspicious !== undefined && suspicious !== null;
  const hasRole = role !== undefined && role !== null;

  if (!hasEmail && !hasVerified && !hasSuspicious && !hasRole) {
    return res.status(400).json({ message: "No update fields provided" });
  }

  const updates = {};
  if (hasEmail) {
    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Invalid email." });
    }
    updates.email = email.trim().toLowerCase();
  }
  if (hasVerified) {
    if (verified !== true) {
      return res.status(400).json({ message: "verified must be true." });
    }
    updates.verified = true;
  }
  if (hasSuspicious) {
    if (typeof suspicious !== 'boolean') {
      return res.status(400).json({ message: "suspicious must be a boolean." });
    }
    updates.suspicious = suspicious;
  }
  if (hasRole) {
    if (!['regular', 'cashier', 'manager', 'superuser'].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (req.user.role === 'manager' && !['regular', 'cashier'].includes(role)) {
      return res.status(403).json({ message: "Unauthorized role change" });
    }
    updates.role = role;
  }

  try {
    const targetUser = await UserService.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (updates.role === 'cashier' && targetUser.suspicious && updates.suspicious !== false) {
      return res.status(400).json({ message: "Cannot promote suspicious user to cashier." });
    }

    const updated = await UserService.updateUser(userId, updates);
    const response = {
      id: updated.id,
      utorid: updated.utorid,
      name: updated.name
    };
    ['email', 'verified', 'suspicious', 'role'].forEach((field) => {
      if (updates[field] !== undefined) {
        response[field] = updated[field];
      }
    });

    return res.status(200).json(response);
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addUserPointsController = async (req, res) => {
  if (!ensureRole(req.user.role, ['manager', 'superuser'])) {
    return res.status(403).json({ message: "Insufficient permission to perform this action." });
  }
  const { userId } = req.params;
  const pointsToAdd = Number(req.body.points);
  if (!Number.isInteger(pointsToAdd) || pointsToAdd <= 0) {
    return res.status(400).json({ message: "Points must be a positive integer" });
  }
  try {
    const updatedUser = await UserService.addPoints(userId, pointsToAdd);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createUserController,
  listUsersController,
  getUserByIdController,
  updateUserController,
  updateSelfController,
  getSelfController,
  updateOwnPasswordController,
  addUserPointsController
};
