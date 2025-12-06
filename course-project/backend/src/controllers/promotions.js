"use strict";
const { PromotionService } = require('../services/promotions');

const createPromotionController = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Name is required.' });
    }
    const { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;

    // Validate required fields with specific error messages FIRST
    if (!name) {
      return res.status(400).json({ message: 'Name is required.' });
    }
    if (!description) {
      return res.status(400).json({ message: 'Description is required.' });
    }
    if (!type) {
      return res.status(400).json({ message: 'Type is required.' });
    }
    if (!startTime) {
      return res.status(400).json({ message: 'Start time is required.' });
    }
    if (!endTime) {
      return res.status(400).json({ message: 'End time is required.' });
    }

    // Then check authorization
    const user = req.user;
    if (!user || (user.role !== 'manager' && user.role !== 'superuser')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await PromotionService.createPromotion(name, description, type, startTime, endTime, minSpending, rate, points);
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    return res.status(201).json(result.promotion);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
const getPromotionsController = async (req, res) => {
  try {
    const user = req.user;
    const { name, type, page = '1', limit = '10', started, ended } = req.query;
    const numPage = parseInt(page);
    const numLimit = parseInt(limit);
    const boolStarted = started === 'true' ? true : started === 'false' ? false : undefined;
    const boolEnded = ended === 'true' ? true : ended === 'false' ? false : undefined;
    const result = await PromotionService.getPromotions(user.role, {
      name,
      type,
      page: numPage,
      limit: numLimit,
      utorid: user.utorid,
      started: boolStarted,
      ended: boolEnded
    });

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    return res.status(200).json(result.data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
const getPromotionByIdController = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const user = req.user;
    const result = await PromotionService.getPromotionById(promotionId, user.role, user.utorid);
    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }
    return res.status(200).json(result.promotion);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
const updatePromotionController = async (req, res) => {
  try {
    const { promotionId } = req.params;
    if (!req.body) {
      return res.status(400).json({ error: 'Bad Request' });
    }
    const updates = req.body;
    const user = req.user;

    // Authorization check
    if (user.role !== 'manager' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // At least one field must be provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Bad Request' });
    }

    // Call service
    const result = await PromotionService.updatePromotion(promotionId, updates);

    if (!result.success) {
      if (result.error === 'Promotion not found') {
        return res.status(404).json({ error: result.error });
      }
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result.promotion);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
const deletePromotionController = async (req, res) => {
  try {
    const { promotionId } = req.params;
    const user = req.user;
    if (user.role !== 'manager' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await PromotionService.deletePromotion(promotionId);
    if (!result.success) {
      if (result.error === 'Promotion not found') {
        return res.status(404).json({ error: result.error });
      }
      if (result.error === 'Cannot delete promotion that has started') {
        return res.status(403).json({ error: result.error });
      }
      return res.status(400).json({ error: result.error });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
module.exports = { createPromotionController, getPromotionsController, getPromotionByIdController, updatePromotionController, deletePromotionController };