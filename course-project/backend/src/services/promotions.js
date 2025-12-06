"use strict";
require("dotenv").config()
const prisma = require('../prisma');

class PromotionService {
  static #normalizeType(rawType) {
    if (typeof rawType !== 'string') {
      return null;
    }
    const normalized = rawType.toLowerCase().replace(/[\s_-]+/g, '');
    if (normalized === 'automatic') {
      return 'automatic';
    }
    if (normalized === 'onetime') {
      return 'onetime';
    }
    return null;
  }

  static async createPromotion(name, description, type, startTime, endTime, minSpending, rate, points) {
    // Check required string fields
    if (typeof name !== 'string' || typeof description !== 'string' || typeof type !== 'string') {
      return { success: false, error: 'Invalid types' };
    }

    const normalizedType = PromotionService.#normalizeType(type);
    if (!normalizedType) {
      return { success: false, error: 'Invalid promotion type' };
    }
    // Check DateTime strings
    if (typeof startTime !== 'string' || typeof endTime !== 'string') {
      return { success: false, error: 'Invalid date format' };
    }
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, error: 'Invalid date format' };
    }
    if (end <= start) {
      return { success: false, error: 'End time must be after start time' };
    }
    // Check optional numeric fields (only if they're provided)
    if (minSpending !== undefined && (typeof minSpending !== 'number' || minSpending <= 0)) {
      return { success: false, error: 'minSpending must be a positive number' };
    }
    if (rate !== undefined && (typeof rate !== 'number' || rate < 0)) {
      return { success: false, error: 'rate must be a positive number' };
    }
    if (points !== undefined && (typeof points !== 'number' || points <= 0 || !Number.isInteger(points))) {
      return { success: false, error: 'points must be a positive integer' };
    }
    const newPromotion = await prisma.promotion.create({
      data: { name, description, type: normalizedType, startTime, endTime, minSpending, rate, points }
    })
    if (!newPromotion) return { success: false, error: 'Failed to create promotion' };
    return { success: true, promotion: newPromotion };
  }

  static async getPromotions(role, { name, type, page, limit, utorid, started, ended }) {
    if (page <= 0) return { success: false, error: 'Page must be greater than 0.' };
    if (limit <= 0) return { success: false, error: 'Limit must be greater than 0.' };

    let normalizedType;
    if (type !== undefined) {
      normalizedType = PromotionService.#normalizeType(type);
      if (!normalizedType) return { success: false, error: 'Invalid promotion type' };
    }

    if ((role === 'manager' || role === 'superuser') && started !== undefined && ended !== undefined) {
      return { success: false, error: 'Cannot filter by both started and ended.' };
    }

    const now = new Date();
    const whereClause = {};

    // Add/Remove filters depending on role
    if (role === 'regular' || role === 'cashier') {
      whereClause.startTime = { lte: now };
      whereClause.endTime = { gte: now };
      const usedPromotionIds = await this.getUserPromotionIds(utorid);
      if (usedPromotionIds.length) whereClause.id = { notIn: usedPromotionIds };
    } else {
      const filters = [];

      if (started === true) filters.push({ startTime: { lte: now } });
      if (started === false) filters.push({ startTime: { gt: now } });
      if (ended === true) filters.push({ endTime: { lte: now } });
      if (ended === false) filters.push({ endTime: { gt: now } });

      if (filters.length) whereClause.AND = filters;
    }

    // Common filters
    if (name) {
      if (Array.isArray(name)) {
        whereClause.OR = name.map(n => ({ name: { contains: n } }));
      } else if (typeof name === 'string') {
        whereClause.name = { contains: name };
      }
    }

    if (normalizedType) whereClause.type = normalizedType;

    const selectFields = {
      id: true,
      name: true,
      type: true,
      endTime: true,
      minSpending: true,
      rate: true,
      points: true,
    };
    if (role === 'manager' || role === 'superuser') {
      selectFields.startTime = true;
    }

    const skip = (page - 1) * limit;

    const [count, results] = await Promise.all([
      prisma.promotion.count({ where: whereClause }),
      prisma.promotion.findMany({ where: whereClause, skip, take: limit, select: selectFields }),
    ]);

    return { success: true, data: { count, results } };
  }

  static async getUserPromotionIds(utorid) {
    // Get all transactions for this user
    const transactions = await prisma.transaction.findMany({
      where: { utorid: utorid },
      select: { promotionIds: true }
    });

    // Extract and flatten promotion IDs
    const allIds = [];
    for (const transaction of transactions) {
      if (transaction.promotionIds) {
        try {
          const ids = JSON.parse(transaction.promotionIds);
          if (Array.isArray(ids)) {
            allIds.push(...ids);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    // Remove duplicates and return
    return [...new Set(allIds)]
      .map((id) => {
        const numeric = Number(id);
        return Number.isInteger(numeric) ? numeric : null;
      })
      .filter((value) => value !== null);
  }

  static async getAvailableOnetimePromotions(utorid) {
    if (typeof utorid !== 'string' || !utorid.trim()) {
      return [];
    }

    const usedIds = await this.getUserPromotionIds(utorid.trim());
    const now = new Date();
    const whereClause = {
      type: 'onetime',
      startTime: { lte: now },
      endTime: { gte: now }
    };

    if (usedIds.length) {
      whereClause.id = { notIn: usedIds };
    }

    const promotions = await prisma.promotion.findMany({
      where: whereClause,
      orderBy: { id: 'asc' }
    });

    return promotions.map((promotion) => ({
      id: promotion.id,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      startTime: promotion.startTime.toISOString(),
      endTime: promotion.endTime.toISOString(),
      minSpending: promotion.minSpending,
      rate: promotion.rate,
      points: promotion.points
    }));
  }
  static async getPromotionById(promotionId, role, utorid) {
    const id = parseInt(promotionId);
    const promotion = await prisma.promotion.findUnique({ where: { id: id } });
    if (!promotion) {
      return { success: false, error: 'Promotion not found' };
    }
    if (role === 'regular' || role === 'cashier') {
      const now = new Date();
      const isActive = promotion.startTime <= now && promotion.endTime > now;
      if (!isActive) {
        return { success: false, error: 'Promotion not found.' };
      }
      const { startTime, ...promotionWithoutStartTime } = promotion;
      return { success: true, promotion: promotionWithoutStartTime };
    }
    return { success: true, promotion: promotion };
  }

  static async updatePromotion(promotionId, updates) {
    const id = parseInt(promotionId);
    const promotion = await prisma.promotion.findUnique({ where: { id: id } });
    if (!promotion) return { success: false, error: 'Promotion not found' };
    const now = new Date();
    const hasStarted = promotion.startTime <= now;
    const hasEnded = promotion.endTime <= now;
    const restrictedAfterStart = ['name', 'description', 'type', 'startTime', 'minSpending', 'rate', 'points'];
    if (hasStarted) {
      const attemptingRestricted = restrictedAfterStart.some(field => updates[field] !== undefined);
      if (attemptingRestricted) {
        return { success: false, error: 'Cannot update these fields after promotion has started' };
      }
    }
    if (hasEnded && updates.endTime !== undefined) {
      return { success: false, error: 'Cannot update endTime after promotion has ended' };
    }

    // Validate new times aren't in the past
    if (updates.type !== undefined) {
      const normalized = PromotionService.#normalizeType(updates.type);
      if (!normalized) {
        return { success: false, error: 'Invalid promotion type' };
      }
      updates.type = normalized;
    }

    if (updates.startTime !== undefined) {
      const newStartTime = new Date(updates.startTime);
      if (isNaN(newStartTime.getTime())) {
        return { success: false, error: 'Invalid date format' };
      }
      if (newStartTime < now) {
        return { success: false, error: 'Start time cannot be in the past' };
      }
    }

    if (updates.endTime !== undefined) {
      const newEndTime = new Date(updates.endTime);
      if (isNaN(newEndTime.getTime())) {
        return { success: false, error: 'Invalid date format' };
      }
      if (newEndTime < now) {
        return { success: false, error: 'End time cannot be in the past' };
      }
    }

    // Validate endTime > startTime
    const finalStartTime = updates.startTime ? new Date(updates.startTime) : new Date(promotion.startTime);
    const finalEndTime = updates.endTime ? new Date(updates.endTime) : new Date(promotion.endTime);

    if (finalEndTime <= finalStartTime) {
      return { success: false, error: 'End time must be after start time' };
    }

    // Validate type if provided
    if (updates.type !== undefined && updates.type !== 'automatic' && updates.type !== 'onetime') {
      return { success: false, error: 'Invalid promotion type' };
    }

    // Validate numeric fields if provided
    if (updates.minSpending !== undefined && (typeof updates.minSpending !== 'number' || updates.minSpending <= 0)) {
      return { success: false, error: 'minSpending must be a positive number' };
    }
    if (updates.rate !== undefined && (typeof updates.rate !== 'number' || updates.rate < 0)) {
      return { success: false, error: 'rate must be a positive number' };
    }
    if (updates.points !== undefined && (typeof updates.points !== 'number' || updates.points <= 0 || !Number.isInteger(updates.points))) {
      return { success: false, error: 'points must be a positive integer' };
    }

    // Update the promotion
    const updatedPromotion = await prisma.promotion.update({
      where: { id: id },
      data: updates
    });

    // Build response: id, name, type + only updated fields
    const response = {
      id: updatedPromotion.id,
      name: updatedPromotion.name,
      type: updatedPromotion.type
    };

    // Add only fields that were updated
    Object.keys(updates).forEach(key => {
      response[key] = updatedPromotion[key];
    });

    return { success: true, promotion: response };
  }
  static async deletePromotion(promotionId) {
    const id = parseInt(promotionId);
    const promotion = await prisma.promotion.findUnique({ where: { id: id } });
    if (!promotion) return { success: false, error: 'Promotion not found' };
    const now = new Date();
    const hasStarted = promotion.startTime <= now;
    if (hasStarted) {
      return { success: false, error: 'Cannot delete promotion that has started' };
    }
    await prisma.promotion.delete({ where: { id: id } });
    return { success: true };
  }
}
module.exports = { PromotionService };
