"use strict";
const prisma = require('../prisma');
const { PromotionService } = require('./promotions');

const POINTS_PER_DOLLAR = 4;

class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

class TransactionService {
  static async createPurchase({ cashier, utorid, spent, promotionIds = [], remark }) {
    const normalizedSpent = Number(spent);
    if (!Number.isFinite(normalizedSpent) || normalizedSpent <= 0) {
      throw new ServiceError(400, "Spent must be a positive number");
    }

    const customer = await prisma.user.findUnique({ where: { utorid } });
    if (!customer) {
      throw new ServiceError(404, "User not found");
    }
    const cashierRecord = await prisma.user.findUnique({ where: { utorid: cashier.utorid } });

    const normalizedPromotions = this.#normalizePromotionIds(promotionIds);
    const { bonusPoints, ids: verifiedPromotions } = await this.#validatePromotions({
      utorid,
      promotionIds: normalizedPromotions,
      spent: normalizedSpent
    });

    const basePoints = Math.round(normalizedSpent * POINTS_PER_DOLLAR);
    const totalPoints = basePoints + bonusPoints;
    const withheld = Boolean(cashierRecord?.suspicious);

    let transaction;
    await prisma.$transaction(async (tx) => {
      transaction = await tx.transaction.create({
        data: {
          type: 'purchase',
          utorid,
          spent: normalizedSpent,
          amount: totalPoints,
          promotionIds: verifiedPromotions,
          remark: remark ?? null,
          createdBy: cashier.utorid,
          suspicious: withheld
        }
      });

      if (!withheld && totalPoints > 0) {
        await tx.user.update({
          where: { utorid },
          data: { points: { increment: totalPoints } }
        });
      }
    });

    return {
      transaction,
      credited: withheld ? 0 : totalPoints
    };
  }

  static async createAdjustment({ utorid, amount, relatedId, remark, createdBy }) {
    const normalizedAmount = Math.trunc(Number(amount));
    if (!Number.isFinite(normalizedAmount) || normalizedAmount === 0) {
      throw new ServiceError(400, "Amount must be a non-zero integer");
    }
    if (!Number.isInteger(Number(relatedId))) {
      throw new ServiceError(400, "relatedId is required for adjustments");
    }

    const customer = await prisma.user.findUnique({ where: { utorid } });
    if (!customer) {
      throw new ServiceError(404, "User not found");
    }

    const relatedTransaction = await prisma.transaction.findUnique({ where: { id: Number(relatedId) } });
    if (!relatedTransaction) {
      throw new ServiceError(404, "Related transaction not found");
    }
    if (relatedTransaction.utorid && relatedTransaction.utorid !== utorid) {
      throw new ServiceError(400, "Related transaction does not belong to this user");
    }

    let transaction;
    await prisma.$transaction(async (tx) => {
      transaction = await tx.transaction.create({
        data: {
          type: 'adjustment',
          utorid,
          amount: normalizedAmount,
          relatedId: Number(relatedId),
          promotionIds: [],
          remark: remark ?? null,
          createdBy,
          suspicious: false
        }
      });

      await tx.user.update({
        where: { utorid },
        data: { points: { increment: normalizedAmount } }
      });
    });

    return transaction;
  }

  static async createTransfer({ senderUtorid, recipientId, amount, remark }) {
    const normalizedAmount = Number(amount);
    if (!Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
      throw new ServiceError(400, "Amount must be a positive integer");
    }
    const recipientUserId = Number(recipientId);
    if (!Number.isInteger(recipientUserId) || recipientUserId <= 0) {
      throw new ServiceError(400, "Invalid recipient");
    }

    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({ where: { utorid: senderUtorid } }),
      prisma.user.findUnique({ where: { id: recipientUserId } })
    ]);

    if (!sender) {
      throw new ServiceError(404, "Sender not found");
    }
    if (!sender.verified) {
      throw new ServiceError(403, "Sender must be verified");
    }
    if (!recipient) {
      throw new ServiceError(404, "Recipient not found");
    }
    if (sender.id === recipient.id) {
      throw new ServiceError(400, "Cannot transfer to yourself");
    }
    if (sender.points < normalizedAmount) {
      throw new ServiceError(400, "Insufficient points");
    }

    let senderTransaction;
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: sender.id },
        data: { points: { decrement: normalizedAmount } }
      });
      await tx.user.update({
        where: { id: recipient.id },
        data: { points: { increment: normalizedAmount } }
      });

      senderTransaction = await tx.transaction.create({
        data: {
          type: 'transfer',
          utorid: sender.utorid,
          sender: sender.utorid,
          recipient: recipient.utorid,
          amount: -normalizedAmount,
          relatedId: recipient.id,
          promotionIds: [],
          remark: remark ?? null,
          createdBy: sender.utorid,
          suspicious: false
        }
      });

      await tx.transaction.create({
        data: {
          type: 'transfer',
          utorid: recipient.utorid,
          sender: sender.utorid,
          recipient: recipient.utorid,
          amount: normalizedAmount,
          relatedId: sender.id,
          promotionIds: [],
          remark: remark ?? null,
          createdBy: sender.utorid,
          suspicious: false
        }
      });
    });

    return senderTransaction;
  }

  static async createRedemption({ utorid, amount, remark }) {
    const normalizedAmount = Number(amount);
    if (!Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
      throw new ServiceError(400, "Amount must be a positive integer");
    }

    const user = await prisma.user.findUnique({ where: { utorid } });
    if (!user) {
      throw new ServiceError(404, "User not found");
    }
    if (!user.verified) {
      throw new ServiceError(403, "User must be verified");
    }
    if (user.points < normalizedAmount) {
      throw new ServiceError(400, "Insufficient points");
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: 'redemption',
        utorid,
        amount: normalizedAmount,
        promotionIds: [],
        remark: remark ?? null,
        createdBy: utorid,
        suspicious: false
      }
    });

    return transaction;
  }

  static async processRedemption(transactionId, processor) {
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction || transaction.type !== 'redemption') {
      throw new ServiceError(404, "Transaction not found");
    }
    if (transaction.processedBy) {
      throw new ServiceError(400, "Transaction already processed");
    }

    const user = await prisma.user.findUnique({ where: { utorid: transaction.utorid } });
    if (!user) {
      throw new ServiceError(404, "User not found");
    }
    const amountToDeduct = Math.abs(transaction.amount ?? 0);
    if (user.points < amountToDeduct) {
      throw new ServiceError(400, "User no longer has enough points");
    }

    let updated;
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { utorid: transaction.utorid },
        data: { points: { decrement: amountToDeduct } }
      });

      updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          processedBy: processor.utorid,
          processedAt: new Date(),
          relatedId: processor.id,
          amount: -amountToDeduct
        }
      });
    });

    return updated;
  }

  static async toggleSuspicion(transactionId, suspiciousValue) {
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      throw new ServiceError(404, "Transaction not found");
    }
    if (transaction.suspicious === suspiciousValue) {
      return this.#serializeTransaction(transaction);
    }

    let updated;
    await prisma.$transaction(async (tx) => {
      const affectsPoints = transaction.utorid && transaction.amount && (transaction.type !== 'redemption' || transaction.processedBy);
      if (affectsPoints) {
        const delta = suspiciousValue ? -transaction.amount : transaction.amount;
        await tx.user.update({
          where: { utorid: transaction.utorid },
          data: { points: { increment: delta } }
        });
      }

      updated = await tx.transaction.update({
        where: { id: transactionId },
        data: { suspicious: suspiciousValue }
      });
    });

    return this.#serializeTransaction(updated);
  }

  static async getTransaction(transactionId) {
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      throw new ServiceError(404, "Transaction not found");
    }
    return this.#serializeTransaction(transaction);
  }

  static async listTransactions(filters) {
    const { name, createdBy, suspicious, promotionId, type, relatedId, amount, operator, page, limit } = filters;
    const pagination = this.#validatePagination(page, limit);

    const andClauses = [];
    if (createdBy) andClauses.push({ createdBy });
    if (typeof suspicious === 'boolean') andClauses.push({ suspicious });
    if (type) andClauses.push({ type });
    if (relatedId !== undefined) andClauses.push({ relatedId });
    if (amount !== undefined && operator) {
      andClauses.push({ amount: { [operator === 'gte' ? 'gte' : 'lte']: amount } });
    }

    if (name) {
      const candidates = await prisma.user.findMany({
        where: {
          OR: [
            { utorid: { contains: name } },
            { name: { contains: name } }
          ]
        },
        select: { utorid: true }
      });
      if (!candidates.length) {
        return { count: 0, results: [] };
      }
      const utorids = candidates.map((u) => u.utorid);
      andClauses.push({
        OR: [
          { utorid: { in: utorids } },
          { sender: { in: utorids } },
          { recipient: { in: utorids } }
        ]
      });
    }

    const where = andClauses.length ? { AND: andClauses } : {};
    const applyPromotionFilter = promotionId !== undefined;

    if (applyPromotionFilter) {
      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { id: 'asc' }
      });
      const filtered = this.#filterByPromotion(transactions, promotionId);
      const count = filtered.length;
      const start = pagination.skip;
      const paginated = filtered.slice(start, start + pagination.take);
      return {
        count,
        results: paginated.map((tx) => this.#serializeTransaction(tx))
      };
    }

    const [count, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    return {
      count,
      results: transactions.map((tx) => this.#serializeTransaction(tx))
    };
  }

  static async listTransactionsForUser(utorid, filters) {
    const { type, relatedId, promotionId, amount, operator, page, limit } = filters;
    const pagination = this.#validatePagination(page, limit);

    const andClauses = [
      {
        OR: [
          { utorid },
          { recipient: utorid },
          { sender: utorid }
        ]
      }
    ];
    if (type) andClauses.push({ type });
    if (relatedId !== undefined) andClauses.push({ relatedId });
    if (amount !== undefined && operator) {
      andClauses.push({ amount: { [operator === 'gte' ? 'gte' : 'lte']: amount } });
    }

    const where = { AND: andClauses };
    const applyPromotionFilter = promotionId !== undefined;

    if (applyPromotionFilter) {
      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { id: 'asc' }
      });
      const filtered = this.#filterByPromotion(transactions, promotionId);
      const count = filtered.length;
      const start = pagination.skip;
      const paginated = filtered.slice(start, start + pagination.take);
      return {
        count,
        results: paginated.map((tx) => this.#serializeTransaction(tx))
      };
    }

    const [count, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    return {
      count,
      results: transactions.map((tx) => this.#serializeTransaction(tx))
    };
  }

  static async logEventAward({ eventId, utorid, points, awardedBy }) {
    const created = await prisma.transaction.create({
      data: {
        type: 'event',
        utorid,
        recipient: utorid,
        amount: Math.trunc(points),
        eventId,
        relatedId: eventId,
        promotionIds: [],
        remark: null,
        createdBy: awardedBy,
        suspicious: false
      }
    });
    return TransactionService.#serializeTransaction(created);
  }

  static #normalizePromotionIds(promotionIds) {
    if (promotionIds === null || promotionIds === undefined) {
      return [];
    }
    if (!Array.isArray(promotionIds)) {
      throw new ServiceError(400, "Promotion IDs must be provided as an array");
    }
    const ids = promotionIds.map((value) => {
      const id = Number(value);
      if (!Number.isInteger(id) || id <= 0) {
        throw new ServiceError(400, "Promotion IDs must be positive integers");
      }
      return id;
    });
    return [...new Set(ids)];
  }

  static async #validatePromotions({ utorid, promotionIds, spent }) {
    if (!promotionIds.length) {
      return { bonusPoints: 0, ids: [] };
    }

    const promotions = await prisma.promotion.findMany({
      where: { id: { in: promotionIds } }
    });
    if (promotions.length !== promotionIds.length) {
      throw new ServiceError(404, "Promotion not found.");
    }

    const usedPromotionIds = await PromotionService.getUserPromotionIds(utorid);
    const now = new Date();
    let bonusPoints = 0;

    for (const promotion of promotions) {
      if (promotion.startTime > now || promotion.endTime < now) {
        throw new ServiceError(400, "Promotion not active");
      }
      if (promotion.minSpending !== null && spent < promotion.minSpending) {
        throw new ServiceError(400, "Minimum spending not met for promotion");
      }
      if (promotion.type === 'onetime' && usedPromotionIds.includes(promotion.id)) {
        throw new ServiceError(400, "Promotion already used");
      }

      if (promotion.rate !== null) {
        bonusPoints += Math.round(spent * promotion.rate);
      }
      if (promotion.points !== null) {
        bonusPoints += promotion.points;
      }
    }

    return { bonusPoints, ids: promotionIds };
  }

  static #serializeTransaction(transaction) {
    const promotionIds = this.#promotionIdsToArray(transaction.promotionIds);
    const base = {
      id: transaction.id,
      type: transaction.type,
      remark: transaction.remark ?? null,
      createdBy: transaction.createdBy
    };

    switch (transaction.type) {
      case 'purchase':
        return {
          ...base,
          utorid: transaction.utorid,
          amount: transaction.amount ?? 0,
          spent: transaction.spent ?? 0,
          promotionIds,
          suspicious: Boolean(transaction.suspicious),
          relatedId: transaction.relatedId ?? null
        };
      case 'adjustment':
        return {
          ...base,
          utorid: transaction.utorid,
          amount: transaction.amount ?? 0,
          relatedId: transaction.relatedId ?? null,
          promotionIds,
          suspicious: Boolean(transaction.suspicious)
        };
      case 'event':
        return {
          ...base,
          utorid: transaction.utorid,
          recipient: transaction.recipient,
          awarded: transaction.amount ?? 0,
          eventId: transaction.eventId ?? null,
          relatedId: transaction.eventId ?? null
        };
      case 'transfer':
        return {
          ...base,
          utorid: transaction.utorid,
          sender: transaction.sender,
          recipient: transaction.recipient,
          sent: Math.abs(transaction.amount ?? 0),
          amount: transaction.amount ?? 0,
          relatedId: transaction.relatedId ?? null
        };
      case 'redemption':
        return {
          ...base,
          utorid: transaction.utorid,
          amount: transaction.amount ?? 0,
          processedBy: transaction.processedBy ?? null,
          redeemed: Math.abs(transaction.amount ?? 0),
          relatedId: transaction.relatedId ?? null
        };
      default:
        return base;
    }
  }

  static #promotionIdsToArray(rawValue) {
    if (!rawValue) {
      return [];
    }
    if (Array.isArray(rawValue)) {
      return rawValue;
    }
    if (typeof rawValue === 'string') {
      try {
        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        return [];
      }
    }
    return [];
  }

  static #validatePagination(page, limit) {
    const normalizedPage = Number(page);
    const normalizedLimit = Number(limit);
    if (!Number.isInteger(normalizedPage) || normalizedPage <= 0) {
      throw new ServiceError(400, "Page must be greater than 0");
    }
    if (!Number.isInteger(normalizedLimit) || normalizedLimit <= 0 || normalizedLimit > 50) {
      throw new ServiceError(400, "Limit must be between 1 and 50");
    }
    return {
      skip: (normalizedPage - 1) * normalizedLimit,
      take: normalizedLimit
    };
  }

  static #filterByPromotion(transactions, promotionId) {
    return transactions.filter((tx) =>
      this.#promotionIdsToArray(tx.promotionIds).includes(Number(promotionId))
    );
  }
}

module.exports = { TransactionService, ServiceError };
