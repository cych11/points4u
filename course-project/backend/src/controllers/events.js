"use strict";
const { EventService, EventError } = require('../services/events');

const handleError = (error, res) => {
  if (error instanceof EventError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};

const parseQueryBoolean = (value) => {
  if (value === undefined) return undefined;
  const normalized = String(value).toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

const createEventController = async (req, res) => {
  try {
    const event = await EventService.createEvent(req.user, req.body ?? {});
    res.status(201).json(event);
  } catch (error) {
    handleError(error, res);
  }
};

const listEventsController = async (req, res) => {
  try {
    const filters = {
      name: req.query.name?.trim() || undefined,
      location: req.query.location?.trim() || undefined,
      started: req.query.started ? parseQueryBoolean(req.query.started) : undefined,
      ended: req.query.ended ? parseQueryBoolean(req.query.ended) : undefined,
      full: req.query.full ? parseQueryBoolean(req.query.full) : undefined,
      showFull: req.query.showFull ? parseQueryBoolean(req.query.showFull) : undefined,
      published: req.query.published ? parseQueryBoolean(req.query.published) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined
    };
    const events = await EventService.listEvents(req.user, filters);
    res.status(200).json(events);
  } catch (error) {
    handleError(error, res);
  }
};

const getEventController = async (req, res) => {
  try {
    const event = await EventService.getEvent(req.user, req.params.eventId);
    res.status(200).json(event);
  } catch (error) {
    handleError(error, res);
  }
};

const updateEventController = async (req, res) => {
  try {
    const event = await EventService.updateEvent(req.user, req.params.eventId, req.body ?? {});
    res.status(200).json(event);
  } catch (error) {
    handleError(error, res);
  }
};

const deleteEventController = async (req, res) => {
  try {
    await EventService.deleteEvent(req.user, req.params.eventId);
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

const addEventOrganizerController = async (req, res) => {
  try {
    const { utorid } = req.body ?? {};
    if (typeof utorid !== 'string' || !utorid.trim()) {
      return res.status(400).json({ message: "Utorid is required." });
    }
    const response = await EventService.addOrganizer(req.user, req.params.eventId, utorid.trim());
    res.status(201).json(response);
  } catch (error) {
    handleError(error, res);
  }
};

const removeEventOrganizerController = async (req, res) => {
  try {
    await EventService.removeOrganizer(req.user, req.params.eventId, req.params.userId);
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

const addEventGuestController = async (req, res) => {
  try {
    const { utorid } = req.body ?? {};
    if (typeof utorid !== 'string' || !utorid.trim()) {
      return res.status(400).json({ message: "Utorid is required." });
    }
    const response = await EventService.addGuest(req.user, req.params.eventId, utorid.trim(), { self: false });
    res.status(201).json(response);
  } catch (error) {
    handleError(error, res);
  }
};

const addSelfEventGuestController = async (req, res) => {
  try {
    const response = await EventService.addGuest(req.user, req.params.eventId, null, { self: true });
    res.status(201).json(response);
  } catch (error) {
    handleError(error, res);
  }
};

const removeEventGuestController = async (req, res) => {
  try {
    await EventService.removeGuest(req.user, req.params.eventId, req.params.userId, { self: false });
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

const removeSelfEventGuestController = async (req, res) => {
  try {
    await EventService.removeGuest(req.user, req.params.eventId, req.user.id, { self: true });
    res.status(204).send();
  } catch (error) {
    handleError(error, res);
  }
};

const confirmAttendanceController = async (req, res) => {
  try {
    await EventService.confirmAttendance(req.user, req.params.eventId, req.params.userId);
    res.status(200).json({ success: true });
  } catch (error) {
    handleError(error, res);
  }
};

const createEventTransactionController = async (req, res) => {
  try {
    const transaction = await EventService.createEventTransaction(req.user, req.params.eventId, req.body ?? {});
    res.status(201).json(transaction);
  } catch (error) {
    handleError(error, res);
  }
};

// Alias controllers for route compatibility
const rsvpEventController = addSelfEventGuestController;
const awardPointsController = createEventTransactionController;

const setOrganizersController = async (req, res) => {
  try {
    const { organizers } = req.body ?? {};
    if (!Array.isArray(organizers)) {
      return res.status(400).json({ message: "Organizers must be an array." });
    }
    
    // Validate all utorids are strings
    for (const utorid of organizers) {
      if (typeof utorid !== 'string' || !utorid.trim()) {
        return res.status(400).json({ message: "Each organizer must be a valid utorid string." });
      }
    }
    
    // Add each organizer (addOrganizer handles duplicates gracefully)
    for (const utorid of organizers) {
      await EventService.addOrganizer(req.user, req.params.eventId, utorid.trim());
    }
    
    // Return the event with updated organizers
    const event = await EventService.getEvent(req.user, req.params.eventId);
    res.status(200).json(event);
  } catch (error) {
    handleError(error, res);
  }
};

module.exports = {
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
};
