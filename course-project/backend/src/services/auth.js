"use strict";
require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../prisma');
const { UserService } = require('./users');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const RESET_EXPIRY_MS = 60 * 60 * 1000;

class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

class AuthService {
  static async login(utorid, password) {
    const user = await prisma.user.findUnique({ where: { utorid } });
    if (!user || !user.password) {
      throw new Error("Invalid Credentials");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error("Incorrect password");
    }

    const payload = { id: user.id, utorid: user.utorid, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    const expiresAt = new Date(Date.now() + ONE_DAY_MS).toISOString();

    await UserService.recordLogin(utorid);

    return { token, expiresAt };
  }

  static async updatePassword(utorid, password, resetToken) {
    const tokenOwner = await prisma.user.findFirst({ where: { resetToken } });
    if (!tokenOwner) {
      throw new AuthError(404, "Token not found");
    }

    if (tokenOwner.utorid !== utorid) {
      throw new AuthError(401, "Token does not match user");
    }

    if (!tokenOwner.expiresAt || tokenOwner.expiresAt.getTime() < Date.now()) {
      await prisma.user.update({
        where: { id: tokenOwner.id },
        data: { resetToken: null, expiresAt: null }
      });
      throw new AuthError(410, "Token expired");
    }

    const hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: tokenOwner.id },
      data: {
        password: hash,
        resetToken: null,
        expiresAt: null
      }
    });
    return true;
  }

  static async createResetRequest(utorid) {
    const user = await prisma.user.findUnique({ where: { utorid } });
    if (!user) {
      throw new AuthError(404, "User not found");
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS);

    await prisma.user.update({
      where: { utorid },
      data: {
        resetToken: token,
        expiresAt
      }
    });

    return {
      expiresAt: expiresAt.toISOString(),
      resetToken: token
    };
  }

  static async register(utorid, name, email, password) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { utorid } });
    if (existingUser) {
      throw new AuthError(409, "User already exists");
    }

    // Check if email is already taken
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new AuthError(409, "Email already registered");
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user with password set
    const user = await prisma.user.create({
      data: {
        utorid: utorid.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hash,
        role: 'regular',
        verified: false
      }
    });

    return {
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      email: user.email
    };
  }
}

module.exports = { AuthService, AuthError };
