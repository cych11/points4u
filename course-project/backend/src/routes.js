"use strict";
const express = require("express");
const auth = require("./middleware/auth");

const {
    createUserController,
    listUsersController,
    getUserByIdController,
    updateUserController,
    updateSelfController,
    getSelfController,
    updateOwnPasswordController
} = require("./controllers/users");

const {
    authenticateUserController,
    resetPasswordController,
    passwordResetRequestController
} = require('./controllers/auth');

const { createTransactionController, getTransactions, getSingleTransaction, setSuspicion, completeRedemption, createUserTransactionController, createOwnTransactionController, getOwnTransactionsController } = require('./controllers/transactions');

const {
    createEventController,
    listEventsController,
    getEventController,
    updateEventController,
    deleteEventController,
    addEventOrganizerController,
    removeEventOrganizerController,
    addEventGuestController,
    addSelfEventGuestController,
    removeEventGuestController,
    removeSelfEventGuestController,
    confirmAttendanceController,
    createEventTransactionController,
    rsvpEventController,
    awardPointsController,
    setOrganizersController
} = require('./controllers/events');

const { createPromotionController, getPromotionsController, getPromotionByIdController, updatePromotionController, deletePromotionController } = require('./controllers/promotions');

const router = express.Router();

// auth
router.post('/auth/tokens', authenticateUserController);
router.post('/auth/resets', passwordResetRequestController);
router.post('/auth/resets/:resetToken', resetPasswordController);

// users
router.post("/users", auth, createUserController);
router.get("/users", auth, listUsersController);
router.patch("/users/me", auth, updateSelfController);
router.get("/users/me", auth, getSelfController);
router.patch("/users/me/password", auth, updateOwnPasswordController);
router.post("/users/me/transactions", auth, createOwnTransactionController);
router.get("/users/me/transactions", auth, getOwnTransactionsController);
router.get("/users/:userId", auth, getUserByIdController);
router.patch("/users/:userId", auth, updateUserController);
router.post("/users/:userId/transactions", auth, createUserTransactionController);

// promotions
router.post("/promotions", auth, createPromotionController);
router.get("/promotions", auth, getPromotionsController);
router.get("/promotions/:promotionId", auth, getPromotionByIdController);
router.patch("/promotions/:promotionId", auth, updatePromotionController);
router.delete("/promotions/:promotionId", auth, deletePromotionController);
// transactions
router.post("/transactions", auth, createTransactionController);
router.get("/transactions", auth, getTransactions);
router.get("/transactions/:transactionId", auth, getSingleTransaction);
router.patch("/transactions/:transactionId/suspicious", auth, setSuspicion);
router.patch("/transactions/:transactionId/processed", auth, completeRedemption);

// events
router.post('/events', auth, createEventController);
router.get('/events', auth, listEventsController);
router.get('/events/:eventId', auth, getEventController);
router.patch('/events/:eventId', auth, updateEventController);
router.delete('/events/:eventId', auth, deleteEventController);
router.post('/events/:eventId/organizers', auth, addEventOrganizerController);
router.patch('/events/:eventId/organizers', auth, setOrganizersController);
router.delete('/events/:eventId/organizers/:userId', auth, removeEventOrganizerController);
router.post('/events/:eventId/guests/me', auth, addSelfEventGuestController);
router.delete('/events/:eventId/guests/me', auth, removeSelfEventGuestController);
router.post('/events/:eventId/guests', auth, addEventGuestController);
router.delete('/events/:eventId/guests/:userId', auth, removeEventGuestController);
router.post('/events/:eventId/rsvps', auth, rsvpEventController);
router.patch('/events/:eventId/rsvps/:userId/confirm', auth, confirmAttendanceController);
router.post('/events/:eventId/transactions', auth, createEventTransactionController);
router.post('/events/:eventId/points', auth, awardPointsController);

module.exports = router;
