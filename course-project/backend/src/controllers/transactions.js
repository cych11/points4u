"use strict";
const { TransactionService, ServiceError } = require("../services/transactions");

const FORBIDDEN_MESSAGE = "Insufficient permission to preform this action.";
const VALID_TRANSACTION_TYPES = ["purchase", "adjustment", "redemption", "transfer", "event"];

const handleError = (error, res) => {
  if (error instanceof ServiceError || typeof error.status === "number") {
    return res.status(error.status ?? 400).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

const parseBoolean = (value) => {
  if (value === undefined) return undefined;
  const normalized = String(value).toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
};

const parseInteger = (value) => {
  if (value === undefined) return undefined;
  const num = Number(value);
  if (!Number.isInteger(num)) {
    return null;
  }
  return num;
};

const parseNumber = (value) => {
  if (value === undefined) return undefined;
  const num = Number(value);
  if (Number.isNaN(num)) {
    return null;
  }
  return num;
};

// POST /transactions -> purchase or adjustment
const createTransactionController = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Transaction type is required" });
    }
    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ message: "Transaction type is required" });
    }

    if (type === "purchase") {
      if (req.user.role === "regular") {
        return res.status(403).json({ message: FORBIDDEN_MESSAGE });
      }
      if (typeof req.body.utorid !== "string" || !req.body.utorid.trim()) {
        return res.status(400).json({ message: "utorid is required" });
      }
      const result = await TransactionService.createPurchase({
        cashier: req.user,
        utorid: req.body.utorid,
        spent: req.body.spent,
        promotionIds: req.body.promotionIds ?? [],
        remark: req.body.remark
      });

      return res.status(201).json({
        id: result.transaction.id,
        utorid: result.transaction.utorid,
        type: "purchase",
        spent: result.transaction.spent ?? 0,
        earned: result.credited,
        remark: result.transaction.remark ?? "",
        promotionIds: Array.isArray(result.transaction.promotionIds) ? result.transaction.promotionIds : [],
        createdBy: result.transaction.createdBy
      });
    }

    if (type === "adjustment") {
      if (req.user.role === "regular" || req.user.role === "cashier") {
        return res.status(403).json({ message: FORBIDDEN_MESSAGE });
      }
      if (typeof req.body.utorid !== "string" || !req.body.utorid.trim()) {
        return res.status(400).json({ message: "utorid is required" });
      }
      const transaction = await TransactionService.createAdjustment({
        utorid: req.body.utorid,
        amount: req.body.amount,
        relatedId: req.body.relatedId,
        remark: req.body.remark,
        createdBy: req.user.utorid
      });

      return res.status(201).json({
        id: transaction.id,
        utorid: transaction.utorid,
        type: "adjustment",
        amount: transaction.amount ?? 0,
        relatedId: transaction.relatedId ?? null,
        remark: transaction.remark ?? null,
        promotionIds: [],
        createdBy: transaction.createdBy
      });
    }

    return res.status(400).json({ message: "Unsupported transaction type" });
  } catch (error) {
    return handleError(error, res);
  }
};

// GET /transactions
const getTransactions = async (req, res) => {
  if (!["manager", "superuser"].includes(req.user.role)) {
    return res.status(403).json({ message: FORBIDDEN_MESSAGE });
  }

  const page = parseInteger(req.query.page ?? "1");
  const limit = parseInteger(req.query.limit ?? "10");
  if (page === null || page <= 0) {
    return res.status(400).json({ message: "Page must be greater than 0." });
  }
  if (limit === null || limit <= 0 || limit > 50) {
    return res.status(400).json({ message: "Limit must be between 1 and 50." });
  }

  const suspicious = parseBoolean(req.query.suspicious);
  if (suspicious === null) {
    return res.status(400).json({ message: "suspicious must be 'true' or 'false'." });
  }

  const type = req.query.type;
  if (type !== undefined && !VALID_TRANSACTION_TYPES.includes(type)) {
    return res.status(400).json({ message: "Invalid transaction type." });
  }

  const relatedIdRaw = req.query.relatedId;
  let relatedId;
  if (relatedIdRaw !== undefined) {
    if (!type) {
      return res.status(400).json({ message: "relatedId filter requires type." });
    }
    relatedId = parseInteger(relatedIdRaw);
    if (relatedId === null) {
      return res.status(400).json({ message: "Invalid relatedId." });
    }
  }

  const promotionIdRaw = req.query.promotionId;
  let promotionId;
  if (promotionIdRaw !== undefined) {
    promotionId = parseInteger(promotionIdRaw);
    if (promotionId === null || promotionId <= 0) {
      return res.status(400).json({ message: "Invalid promotionId." });
    }
  }

  let amount;
  const amountRaw = req.query.amount;
  if (amountRaw !== undefined) {
    amount = parseNumber(amountRaw);
    if (amount === null) {
      return res.status(400).json({ message: "Invalid amount filter." });
    }
    if (!req.query.operator) {
      return res.status(400).json({ message: "operator is required when filtering by amount." });
    }
  }

  let operator;
  if (req.query.operator) {
    operator = String(req.query.operator).toLowerCase();
    if (!["gte", "lte"].includes(operator)) {
      return res.status(400).json({ message: "operator must be 'gte' or 'lte'." });
    }
    if (amount === undefined) {
      return res.status(400).json({ message: "amount is required when operator is provided." });
    }
  }

  const createdByRaw = req.query.createdBy?.trim();
  let createdBy;
  if (createdByRaw !== undefined && createdByRaw !== "") {
    createdBy = createdByRaw.split(',').map(s => s.trim()).filter(Boolean);
  }

  try {
    const result = await TransactionService.listTransactions({
      name: req.query.name?.trim(),
      createdBy,
      suspicious,
      promotionId,
      type,
      relatedId,
      amount,
      operator,
      page,
      limit
    });
    return res.status(200).json(result);
  } catch (error) {
    return handleError(error, res);
  }
};

// GET /transactions/:transactionId
const getSingleTransaction = async (req, res) => {
  if (req.user.role === "regular" || req.user.role === "cashier") {
    return res.status(403).json({ message: FORBIDDEN_MESSAGE });
  }
  try {
    const transactionId = Number(req.params.transactionId);
    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }
    const result = await TransactionService.getTransaction(transactionId);
    return res.status(200).json(result);
  } catch (error) {
    return handleError(error, res);
  }
};

// PATCH /transactions/:transactionId/suspicious
const setSuspicion = async (req, res) => {
  if (req.user.role === "regular" || req.user.role === "cashier") {
    return res.status(403).json({ message: FORBIDDEN_MESSAGE });
  }
  if (!req.body) {
    return res.status(400).json({ message: "suspicious must be a boolean" });
  }
  const { suspicious } = req.body;
  if (typeof suspicious !== "boolean") {
    return res.status(400).json({ message: "suspicious must be a boolean" });
  }
  try {
    const transactionId = Number(req.params.transactionId);
    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }
    const updated = await TransactionService.toggleSuspicion(transactionId, suspicious);
    return res.status(200).json(updated);
  } catch (error) {
    return handleError(error, res);
  }
};

// PATCH /transactions/:transactionId/processed
const completeRedemption = async (req, res) => {
  if (req.user.role === "regular" || req.user.role === "cashier") {
    return res.status(403).json({ message: FORBIDDEN_MESSAGE });
  }
  if (!req.body || req.body.processed !== true) {
    return res.status(400).json({ message: "processed must be true" });
  }
  try {
    const transactionId = Number(req.params.transactionId);
    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }
    const processor = { id: req.user.id, utorid: req.user.utorid };
    const transaction = await TransactionService.processRedemption(transactionId, processor);
    return res.status(200).json({
      id: transaction.id,
      utorid: transaction.utorid,
      type: "redemption",
      processedBy: transaction.processedBy,
      redeemed: transaction.amount ?? 0,
      remark: transaction.remark ?? null,
      createdBy: transaction.createdBy
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// POST /users/:userId/transactions (transfer)
const createUserTransactionController = async (req, res) => {
  try {
    if (!req.body || req.body.type !== "transfer") {
      return res.status(400).json({ message: "Only transfer transactions are supported" });
    }
    const targetId = Number(req.params.userId);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const transaction = await TransactionService.createTransfer({
      senderUtorid: req.user.utorid,
      recipientId: targetId,
      amount: req.body.amount,
      remark: req.body.remark
    });
    return res.status(201).json({
      id: transaction.id,
      sender: transaction.sender,
      recipient: transaction.recipient,
      type: "transfer",
      sent: Math.abs(transaction.amount ?? 0),
      amount: transaction.amount ?? 0,
      relatedId: transaction.relatedId ?? null,
      remark: transaction.remark ?? null,
      createdBy: transaction.createdBy
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// POST /users/me/transactions (redemption requests)
const createOwnTransactionController = async (req, res) => {
  try {
    if (!req.body || req.body.type !== "redemption") {
      return res.status(400).json({ message: "Only redemption transactions are supported" });
    }
    const transaction = await TransactionService.createRedemption({
      utorid: req.user.utorid,
      amount: req.body.amount,
      remark: req.body.remark
    });
    return res.status(201).json({
      id: transaction.id,
      utorid: transaction.utorid,
      type: "redemption",
      processedBy: transaction.processedBy ?? null,
      amount: transaction.amount ?? 0,
      remark: transaction.remark ?? null,
      createdBy: transaction.createdBy
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// GET /users/me/transactions
const getOwnTransactionsController = async (req, res) => {
  const page = parseInteger(req.query.page ?? "1");
  const limit = parseInteger(req.query.limit ?? "10");
  if (page === null || page <= 0) {
    return res.status(400).json({ message: "Page must be greater than 0." });
  }
  if (limit === null || limit <= 0 || limit > 50) {
    return res.status(400).json({ message: "Limit must be between 1 and 50." });
  }

  const type = req.query.type;
  if (type !== undefined && !VALID_TRANSACTION_TYPES.includes(type)) {
    return res.status(400).json({ message: "Invalid transaction type." });
  }

  const relatedIdRaw = req.query.relatedId;
  let relatedId;
  if (relatedIdRaw !== undefined) {
    if (!type) {
      return res.status(400).json({ message: "relatedId filter requires type." });
    }
    relatedId = parseInteger(relatedIdRaw);
    if (relatedId === null) {
      return res.status(400).json({ message: "Invalid relatedId." });
    }
  }

  const promotionIdRaw = req.query.promotionId;
  let promotionId;
  if (promotionIdRaw !== undefined) {
    promotionId = parseInteger(promotionIdRaw);
    if (promotionId === null || promotionId <= 0) {
      return res.status(400).json({ message: "Invalid promotionId." });
    }
  }

  let amount;
  const amountRaw = req.query.amount;
  if (amountRaw !== undefined) {
    amount = parseNumber(amountRaw);
    if (amount === null) {
      return res.status(400).json({ message: "Invalid amount filter." });
    }
    if (!req.query.operator) {
      return res.status(400).json({ message: "operator is required when filtering by amount." });
    }
  }

  let operator;
  if (req.query.operator) {
    operator = String(req.query.operator).toLowerCase();
    if (!["gte", "lte"].includes(operator)) {
      return res.status(400).json({ message: "operator must be 'gte' or 'lte'." });
    }
    if (amount === undefined) {
      return res.status(400).json({ message: "amount is required when operator is provided." });
    }
  }

  try {
    const result = await TransactionService.listTransactionsForUser(req.user.utorid, {
      type,
      relatedId,
      promotionId,
      amount,
      operator,
      page,
      limit
    });
    return res.status(200).json(result);
  } catch (error) {
    return handleError(error, res);
  }
};

module.exports = {
  createTransactionController,
  getTransactions,
  getSingleTransaction,
  setSuspicion,
  completeRedemption,
  createUserTransactionController,
  createOwnTransactionController,
  getOwnTransactionsController
};
