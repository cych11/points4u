"use strict";
const { Prisma } = require('@prisma/client');
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const prisma = require('../prisma');
const { PromotionService } = require('./promotions');

const ACTIVATION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

const toISODate = (value) => (value ? value.toISOString() : null);
const toISODateOnly = (value) => (value ? value.toISOString().split('T')[0] : null);

class UserService {
  static async createUser({ utorid, name, email }) {
    try {
      const activationToken = uuidv4();
      const expiresAt = new Date(Date.now() + ACTIVATION_EXPIRY_MS);

      const user = await prisma.user.create({
        data: {
          utorid,
          name,
          email,
          role: 'regular',
          verified: false,
          resetToken: activationToken,
          expiresAt,
          password: null
        }
      });

      return {
        id: user.id,
        utorid: user.utorid,
        name: user.name,
        email: user.email,
        verified: user.verified,
        expiresAt: toISODate(user.expiresAt),
        resetToken: user.resetToken
      };
    } catch (error) {
      UserService.handleKnownErrors(error);
    }
  }

  static async listUsers(filters) {
    const { name, role, verified, activated, page, limit } = filters;
    const where = {};

    if (name) {
      where.OR = [
        { utorid: { contains: name } },
        { name: { contains: name } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (typeof verified === 'boolean') {
      where.verified = verified;
    }

    if (typeof activated === 'boolean') {
      where.lastLogin = activated ? { not: null } : null;
    }

    const skip = (page - 1) * limit;

    const [count, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take: limit
      })
    ]);

    return {
      count,
      results: users.map((user) => UserService.#serializeUser(user))
    };
  }

  static async findById(userId) {
    return prisma.user.findUnique({ where: { id: userId } });
  }

  static async updateUser(userId, data) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data
      });
    } catch (error) {
      UserService.handleKnownErrors(error);
    }
  }

  static async updateSelf(utorid, data) {
    try {
      const updated = await prisma.user.update({
        where: { utorid },
        data
      });
      return UserService.#serializeUser(updated);
    } catch (error) {
      UserService.handleKnownErrors(error);
    }
  }

  static async getSelf(utorid) {
    const user = await prisma.user.findUnique({ where: { utorid } });
    if (!user) {
      throw new Error("Not Found");
    }
    return UserService.#serializeUser(user);
  }

  static async updateOwnPassword(utorid, oldPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { utorid } });
    if (!user || !user.password) {
      throw new Error("Forbidden");
    }
    const matches = await bcrypt.compare(oldPassword, user.password);
    if (!matches) {
      throw new Error("Forbidden");
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { utorid },
      data: { password: hash }
    });
  }

  static async recordLogin(utorid) {
    await prisma.user.update({
      where: { utorid },
      data: { lastLogin: new Date() }
    });
  }

  static async addPoints(utorid, points) {
    return await prisma.user.update({ where: { utorid }, data: { points: { increment: points } } });
  }

  static async getAvailablePromotions(utorid) {
    const promotions = await PromotionService.getAvailableOnetimePromotions(utorid);
    return promotions;
  }

  static handleKnownErrors(error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = Array.isArray(error.meta?.target) ? error.meta.target : [];
      if (target.includes('email')) {
        const err = new Error('Email already in use');
        err.status = 409;
        throw err;
      }
      if (target.includes('utorid')) {
        const err = new Error('Utorid already exists');
        err.status = 409;
        throw err;
      }
    }
    throw error;
  }

  static #serializeUser(user) {
    return {
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      email: user.email,
      birthday: toISODateOnly(user.birthday),
      role: user.role,
      points: user.points,
      createdAt: toISODate(user.createdAt),
      lastLogin: toISODate(user.lastLogin),
      verified: user.verified,
      avatarUrl: user.avatarUrl,
      suspicious: user.suspicious
    };
  }
}

module.exports = { UserService };
