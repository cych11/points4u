"use strict";
const prisma = require('../prisma');

class EventError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const EVENT_INCLUDE = {
  organizers: {
    include: {
      user: {
        select: {
          id: true,
          utorid: true,
          name: true
        }
      }
    }
  },
  rsvps: {
    include: {
      user: {
        select: {
          id: true,
          utorid: true,
          name: true
        }
      }
    }
  },
  awards: true
};

const RSVP_STATUS = {
  RSVPED: 'RSVPED'
};

class EventService {
  static async createEvent(actor, payload) {
    // Validate required fields FIRST before checking authorization
    const name = EventService.#requireString(payload.name, "Name is required.");
    const description = EventService.#requireString(payload.description, "Description is required.");
    const location = EventService.#requireString(payload.location, "Location is required.");

    const { startTime, endTime } = EventService.#parseEventTimes(payload.startTime, payload.endTime);

    const capacity = EventService.#parseCapacity(payload.capacity);
    const points = EventService.#parsePoints(payload.points);

    // Check authorization AFTER validation passes
    EventService.#requireManager(actor);

    const organizerIds = EventService.#parseIdArray(payload.organizers);
    if (organizerIds.includes(actor.id)) {
      throw new EventError(400, "Organizer list cannot include creator.");
    }

    const organizers = organizerIds.length
      ? await prisma.user.findMany({
        where: { id: { in: organizerIds } },
        select: { id: true }
      })
      : [];

    if (organizers.length !== organizerIds.length) {
      throw new EventError(404, "One or more organizers not found.");
    }

    const event = await prisma.event.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        startTime,
        endTime,
        capacity,
        points,
        createdById: actor.id,
        organizers: organizerIds.length
          ? {
            createMany: {
              data: organizerIds.map((id) => ({ userId: id }))
            }
          }
          : undefined
      },
      include: EVENT_INCLUDE
    });

    return EventService.#serializeManagerEvent(event);
  }

  static async listEvents(actor, filters) {
    const page = EventService.#parsePositiveInt(filters.page, "Invalid page number");
    const limit = EventService.#parsePositiveInt(filters.limit, "Invalid limit number", 50);

    const started = EventService.#parseOptionalBoolean(filters.started);
    const ended = EventService.#parseOptionalBoolean(filters.ended);
    if (started !== undefined && ended !== undefined) {
      throw new EventError(400, "Cannot filter by both started and ended.");
    }

    const role = actor.role;
    const isManager = EventService.#isManager(actor);
    const publishedFilter = filters.published !== undefined ? EventService.#parseOptionalBoolean(filters.published) : undefined;
    const whereClause = {};
    const andFilters = [];

    if (publishedFilter !== undefined && !isManager) {
      throw new EventError(400, "Published filter requires manager access.");
    }

    // name filter
    if (filters.name) {
      if (Array.isArray(filters.name)) {
        // OR across multiple name substrings
        andFilters.push({
          OR: filters.name.map(n => ({ name: { contains: n, mode: 'insensitive' } }))
        });
      } else if (typeof filters.name === 'string') {
        andFilters.push({ name: { contains: filters.name, mode: 'insensitive' } });
      }
    }

    // location filter
    if (filters.location) {
      if (Array.isArray(filters.location)) {
        andFilters.push({
          OR: filters.location.map(l => ({ location: { contains: l, mode: 'insensitive' } }))
        });
      } else if (typeof filters.location === 'string') {
        andFilters.push({ location: { contains: filters.location, mode: 'insensitive' } });
      }
    }

    // published: only allow manager to use publishedFilter; otherwise enforce published=true
    if (!isManager) {
      andFilters.push({ published: true });
    } else if (publishedFilter !== undefined) {
      andFilters.push({ published: publishedFilter });
    }

    // finally set whereClause
    if (andFilters.length) {
      whereClause.AND = andFilters;
    }

    const baseEvents = await prisma.event.findMany({
      where: whereClause,
      orderBy: { startTime: 'asc' },
      include: EVENT_INCLUDE
    });

    const filteredByTime = baseEvents.filter((event) => {
      const now = new Date();
      if (started === true && event.startTime > now) return false;
      if (started === false && event.startTime <= now) return false;
      if (ended === true && event.endTime > now) return false;
      if (ended === false && event.endTime <= now) return false;
      return true;
    });

    const fullParam = EventService.#parseOptionalBoolean(filters.full ?? filters.showFull);
    let finalEvents = filteredByTime;
    if (fullParam === true) {
      finalEvents = finalEvents.filter((event) => EventService.#isFull(event));
    } else if (fullParam === false) {
      finalEvents = finalEvents.filter((event) => !EventService.#isFull(event));
    }

    const totalCount = filteredByTime.length;
    const startIndex = (page - 1) * limit;
    const paginated = finalEvents;

    const results = paginated.map((event) =>
      isManager
        ? EventService.#serializeManagerListEvent(event)
        : EventService.#serializePublicListEvent(event)
    );

    return {
      count: totalCount,
      results
    };
  }

  static async getEvent(actor, eventId) {
    const event = await EventService.#loadEvent(eventId);
    const isManager = EventService.#isManager(actor);
    const isOrganizer = EventService.#isOrganizer(event, actor.id);

    if (!event.published && !isManager && !isOrganizer) {
      throw new EventError(404, "Event not found.");
    }

    if (isManager || isOrganizer) {
      return EventService.#serializeManagerEvent(event);
    }

    return EventService.#serializePublicEvent(event);
  }

  static async updateEvent(actor, eventId, updates) {
    if (!updates || Object.keys(updates).length === 0) {
      throw new EventError(400, "At least one field must be provided.");
    }

    const filteredUpdates = EventService.#filterNullishUpdates(updates);
    if (Object.keys(filteredUpdates).length === 0) {
      throw new EventError(400, "At least one field must be provided.");
    }

    const event = await EventService.#loadEvent(eventId);
    const isManager = EventService.#isManager(actor);
    const isOrganizer = EventService.#isOrganizer(event, actor.id);

    if (!isManager && !isOrganizer) {
      throw new EventError(403, "Insufficient permission to preform this action.");
    }

    const data = {};

    const now = new Date();
    const hasStarted = event.startTime <= now;
    const hasEnded = event.endTime <= now;

    if (hasStarted) {
      EventService.#rejectImmutableUpdates(filteredUpdates, ['name', 'description', 'location', 'startTime', 'capacity']);
    }

    if (hasEnded) {
      EventService.#rejectImmutableUpdates(filteredUpdates, ['endTime']);
    }

    if (filteredUpdates.name !== undefined) {
      data.name = EventService.#requireString(filteredUpdates.name, "Name is required.").trim();
    }
    if (filteredUpdates.description !== undefined) {
      data.description = EventService.#requireString(filteredUpdates.description, "Description is required.").trim();
    }
    if (filteredUpdates.location !== undefined) {
      data.location = EventService.#requireString(filteredUpdates.location, "Location is required.").trim();
    }
    if (filteredUpdates.startTime !== undefined || filteredUpdates.endTime !== undefined) {
      const now = new Date();
      const newStart = filteredUpdates.startTime ? EventService.#parseDate(filteredUpdates.startTime, "Invalid event start time.") : event.startTime;
      const newEnd = filteredUpdates.endTime ? EventService.#parseDate(filteredUpdates.endTime, "Invalid event time.") : event.endTime;

      if (filteredUpdates.startTime !== undefined && newStart <= now) {
        throw new EventError(400, "Invalid event start time.");
      }
      if (filteredUpdates.endTime !== undefined && newEnd <= now) {
        throw new EventError(400, "Invalid event time.");
      }
      if (newEnd <= newStart) {
        throw new EventError(400, "Invalid event time.");
      }
      data.startTime = newStart;
      data.endTime = newEnd;
    }
    if (filteredUpdates.capacity !== undefined) {
      if (event.capacity !== null && filteredUpdates.capacity === null) {
        throw new EventError(400, "Invalid event capacity.");
      }
      data.capacity = EventService.#parseCapacity(filteredUpdates.capacity);
    }
    if (filteredUpdates.points !== undefined) {
      if (!isManager) {
        throw new EventError(403, "Permission denied.");
      }
      const parsedPoints = EventService.#parsePoints(filteredUpdates.points);
      const { pointsAwarded } = EventService.#computePointsState(event);
      if (parsedPoints < pointsAwarded) {
        throw new EventError(400, "Invalid event points.");
      }
      data.points = parsedPoints;
    }
    if (filteredUpdates.published !== undefined) {
      if (!isManager) {
        throw new EventError(403, "Insufficient permission to preform this action.");
      }
      const publishValue = EventService.#parseOptionalBoolean(filteredUpdates.published);
      if (publishValue === undefined) {
        throw new EventError(400, "Invalid publish value.");
      }
      data.published = publishValue;
    }

    const updated = await prisma.event.update({
      where: { id: event.id },
      data,
      include: EVENT_INCLUDE
    });

    return EventService.#serializeManagerSummary(updated);
  }

  static async deleteEvent(actor, eventId) {
    EventService.#requireManager(actor);
    const id = Number(eventId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new EventError(400, "Invalid event id.");
    }

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new EventError(404, "Event not found.");
    }
    const now = new Date();
    if (event.published || event.startTime <= now) {
      throw new EventError(400, "Cannot delete published event.");
    }
    await prisma.$transaction([
      prisma.eventPointAward.deleteMany({ where: { eventId: id } }),
      prisma.eventRSVP.deleteMany({ where: { eventId: id } }),
      prisma.eventOrganizer.deleteMany({ where: { eventId: id } }),
      prisma.event.delete({ where: { id } })
    ]);
  }

  static async addOrganizer(actor, eventId, utorid) {
    EventService.#requireManager(actor);
    const event = await EventService.#loadEvent(eventId, { includeGuests: false });
    EventService.#ensureEventNotEnded(event, "Cannot update organizers after event end.");
    const user = await EventService.#getUserByUtorid(utorid);

    const existingGuest = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id
        }
      }
    });
    if (existingGuest) {
      throw new EventError(400, "Cannot add organizer as guest.");
    }

    const alreadyOrganizer = event.organizers.some((entry) => entry.userId === user.id);
    if (alreadyOrganizer) {
      return EventService.#serializeOrganizerMutation(event);
    }

    await prisma.eventOrganizer.create({
      data: {
        eventId: event.id,
        userId: user.id
      }
    });

    const refreshed = await EventService.#loadEvent(eventId, { includeGuests: false });
    return EventService.#serializeOrganizerMutation(refreshed);
  }

  static async removeOrganizer(actor, eventId, organizerUserId) {
    EventService.#requireManager(actor);
    const event = await prisma.event.findUnique({ where: { id: Number(eventId) } });
    if (!event) {
      throw new EventError(404, "Event not found.");
    }
    await prisma.eventOrganizer.deleteMany({
      where: {
        eventId: event.id,
        userId: Number(organizerUserId)
      }
    });
  }

  static async addGuest(actor, eventId, utorid, { self }) {
    // Validate utorid FIRST (for non-self requests) before loading event
    if (!self && (!utorid || typeof utorid !== 'string' || !utorid.trim())) {
      throw new EventError(400, "Utorid is required.");
    }

    const guestUtorid = self ? actor.utorid : utorid;

    // Load event and check event state (410 errors should come before 403)
    const event = await EventService.#loadEvent(eventId);
    EventService.#ensureEventNotEnded(event, "Cannot add guest after event end.");
    EventService.#ensureCapacityAvailable(event);

    // Check authorization AFTER validation and event state checks
    const isManager = EventService.#isManager(actor);
    const isOrganizer = EventService.#isOrganizer(event, actor.id);

    if (!isManager && !isOrganizer && !self) {
      throw new EventError(403, "Insufficient permission to preform this action.");
    }

    const guestUser = await EventService.#getUserByUtorid(guestUtorid);

    if (event.organizers.some((entry) => entry.userId === guestUser.id)) {
      throw new EventError(400, "Cannot add organizer as guest.");
    }

    const existing = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: guestUser.id
        }
      }
    });
    if (existing) {
      if (existing.status === RSVP_STATUS.RSVPED) {
        throw new EventError(409, "User already a guest.");
      }
    }

    await prisma.eventRSVP.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: guestUser.id
        }
      },
      create: {
        eventId: event.id,
        userId: guestUser.id,
        status: RSVP_STATUS.RSVPED
      },
      update: {
        status: RSVP_STATUS.RSVPED,
        attended: false
      }
    });

    const updated = await EventService.#loadEvent(eventId);
    return EventService.#serializeGuestMutationResponse(updated, guestUser);
  }

  static async removeGuest(actor, eventId, targetUserId, { self }) {
    const event = await EventService.#loadEvent(eventId, { includeGuests: true });
    const isManager = EventService.#isManager(actor);

    if (self) {
      EventService.#ensureEventNotEnded(event, "Cannot delete guest after event end.");
    } else if (!isManager) {
      throw new EventError(403, "Insufficient permission to preform this action.");
    }

    const userId = self ? actor.id : Number(targetUserId);
    const guestRecord = event.rsvps.find((rsvp) => rsvp.userId === userId && rsvp.status === RSVP_STATUS.RSVPED);

    if (!guestRecord) {
      throw new EventError(404, "Guest not found.");
    }

    await prisma.eventRSVP.delete({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId
        }
      }
    });
  }

  static async createEventTransaction(actor, eventId, payload) {
    // Validate payload FIRST before checking authorization
    if (payload.type !== 'event') {
      throw new EventError(400, "Invalid transaction type.");
    }

    const amount = EventService.#parsePoints(payload.amount, "Invalid points.");

    // Load event and check authorization AFTER validation
    const event = await EventService.#loadEvent(eventId);
    const isManager = EventService.#isManager(actor);
    const isOrganizer = EventService.#isOrganizer(event, actor.id);

    if (!isManager && !isOrganizer) {
      throw new EventError(403, "Insufficient permission to preform this action.");
    }
    const recipients = await EventService.#resolveRecipients(event, payload.utorid);
    if (!recipients.length) {
      throw new EventError(400, "User is not a guest.");
    }

    const { pointsRemain } = EventService.#computePointsState(event);
    if (amount * recipients.length > pointsRemain) {
      throw new EventError(400, "Invalid points.");
    }

    const results = [];
    await prisma.$transaction(async (tx) => {
      for (const guest of recipients) {
        await tx.eventPointAward.create({
          data: {
            eventId: event.id,
            attendeeId: guest.userId,
            awardedById: actor.id,
            points: amount
          }
        });

        await tx.user.update({
          where: { id: guest.userId },
          data: { points: { increment: amount } }
        });

        const transaction = await tx.transaction.create({
          data: {
            type: 'event',
            utorid: guest.user.utorid,
            recipient: guest.user.utorid,
            amount,
            eventId: event.id,
            relatedId: event.id,
            promotionIds: [],
            remark: payload.remark ?? null,
            createdBy: actor.utorid,
            suspicious: false
          }
        });

        results.push({
          id: transaction.id,
          recipient: guest.user.utorid,
          awarded: transaction.amount ?? 0,
          type: 'event',
          relatedId: event.id,
          remark: transaction.remark ?? null,
          createdBy: transaction.createdBy
        });
      }
    });

    return payload.utorid ? results[0] : results;
  }

  static async confirmAttendance(actor, eventId, guestId) {
    const event = await EventService.#loadEvent(eventId);
    const isManager = EventService.#isManager(actor);
    const isOrganizer = EventService.#isOrganizer(event, actor.id);

    if (!isManager && !isOrganizer) {
      throw new EventError(403, "Insufficient permission to preform this action.");
    }

    const guestRecord = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: Number(guestId)
        }
      }
    });
    if (!guestRecord || guestRecord.status !== RSVP_STATUS.RSVPED) {
      throw new EventError(404, "Guest not found.");
    }

    await prisma.eventRSVP.update({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: Number(guestId)
        }
      },
      data: {
        attended: true
      }
    });
  }

  // Helpers
  static async #loadEvent(eventId, options = { includeGuests: true }) {
    const include = options.includeGuests === false
      ? {
        organizers: EVENT_INCLUDE.organizers,
        awards: true
      }
      : EVENT_INCLUDE;
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      include
    });
    if (!event) {
      throw new EventError(404, "Event not found.");
    }
    return event;
  }

  static #requireString(value, message) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new EventError(400, message);
    }
    return value;
  }

  static #parseEventTimes(start, end) {
    const startTime = EventService.#parseDate(start, "Invalid event start time.");
    const endTime = EventService.#parseDate(end, "Invalid event time.");
    if (endTime <= startTime) {
      throw new EventError(400, "Invalid event time.");
    }
    return { startTime, endTime };
  }

  static #parseDate(value, message) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new EventError(400, message);
    }
    return date;
  }

  static #parseCapacity(value) {
    if (value === null || value === undefined) {
      return null;
    }
    const capacity = Number(value);
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new EventError(400, "Invalid event capacity.");
    }
    return capacity;
  }

  static #parsePoints(value, message = "Invalid event points.") {
    const points = Number(value);
    if (!Number.isInteger(points) || points <= 0) {
      throw new EventError(400, message);
    }
    return points;
  }

  static #parseIdArray(values) {
    if (!values) return [];
    if (!Array.isArray(values)) {
      throw new EventError(400, "Invalid organizers list.");
    }
    const ids = values.map((value) => {
      const id = Number(value);
      if (!Number.isInteger(id) || id <= 0) {
        throw new EventError(400, "Invalid organizers list.");
      }
      return id;
    });
    return [...new Set(ids)];
  }

  static #parsePositiveInt(value, errorMessage, max = Infinity) {
    if (value === undefined) return 1;
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0 || num > max) {
      throw new EventError(400, errorMessage);
    }
    return num;
  }

  static #parseOptionalBoolean(value) {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
    throw new EventError(400, "Invalid boolean value.");
  }

  static #isManager(actor) {
    return actor.role === 'manager' || actor.role === 'superuser';
  }

  static #requireManager(actor) {
    if (!EventService.#isManager(actor)) {
      throw new EventError(403, "Insufficient permission to preform this action.");
    }
  }

  static async #getUserByUtorid(utorid) {
    const user = await prisma.user.findUnique({
      where: { utorid },
      select: { id: true, utorid: true, name: true }
    });
    if (!user) {
      throw new EventError(404, "User not found.");
    }
    return user;
  }

  static #isOrganizer(event, userId) {
    return event.organizers.some((entry) => entry.userId === userId);
  }

  static #isFull(event) {
    if (event.capacity === null) {
      return false;
    }
    return EventService.#countGuests(event) >= event.capacity;
  }

  static #countGuests(event) {
    return event.rsvps.filter((rsvp) => rsvp.status === RSVP_STATUS.RSVPED).length;
  }

  static #computePointsState(event) {
    const awarded = event.awards.reduce((sum, award) => sum + award.points, 0);
    return {
      pointsAwarded: awarded,
      pointsRemain: Math.max(event.points - awarded, 0)
    };
  }

  static #ensureEventNotEnded(event, message) {
    if (event.endTime <= new Date()) {
      throw new EventError(410, message);
    }
  }

  static #ensureCapacityAvailable(event) {
    if (event.capacity === null) {
      return;
    }
    if (EventService.#countGuests(event) >= event.capacity) {
      throw new EventError(410, "Event is at full capacity.");
    }
  }

  static async #resolveRecipients(event, utorid) {
    const eligible = (rsvp) => rsvp.status === RSVP_STATUS.RSVPED;

    if (utorid) {
      const user = await EventService.#getUserByUtorid(utorid);
      const match = event.rsvps.find((rsvp) => rsvp.userId === user.id && eligible(rsvp));
      if (!match) {
        return [];
      }
      return [{ ...match, user }];
    }

    return event.rsvps
      .filter(eligible)
      .sort((a, b) => a.userId - b.userId)
      .map((rsvp) => ({ ...rsvp, user: rsvp.user }));
  }

  static #serializeOrganizer(entry) {
    return {
      id: entry.user.id,
      utorid: entry.user.utorid,
      name: entry.user.name
    };
  }

  static #serializeOrganizerMutation(event) {
    return {
      id: event.id,
      name: event.name,
      location: event.location,
      organizers: event.organizers.map((entry) => EventService.#serializeOrganizer(entry))
    };
  }

  static #serializeGuestMutationResponse(event, guestUser) {
    return {
      id: event.id,
      name: event.name,
      location: event.location,
      guestAdded: {
        id: guestUser.id,
        utorid: guestUser.utorid,
        name: guestUser.name
      },
      numGuests: EventService.#countGuests(event)
    };
  }

  static #serializePublicListEvent(event) {
    return {
      id: event.id,
      name: event.name,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      capacity: event.capacity,
      numGuests: EventService.#countGuests(event)
    };
  }

  static #serializeManagerListEvent(event) {
    const pointsState = EventService.#computePointsState(event);
    return {
      id: event.id,
      name: event.name,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      capacity: event.capacity,
      pointsRemain: pointsState.pointsRemain,
      pointsAwarded: pointsState.pointsAwarded,
      published: event.published,
      numGuests: EventService.#countGuests(event)
    };
  }

  static #serializeManagerSummary(event) {
    const pointsState = EventService.#computePointsState(event);
    return {
      id: event.id,
      name: event.name,
      location: event.location,
      pointsRemain: pointsState.pointsRemain,
      pointsAwarded: pointsState.pointsAwarded
    };
  }

  static #serializeManagerEvent(event) {
    const pointsState = EventService.#computePointsState(event);
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      capacity: event.capacity,
      guests: EventService.#serializeGuests(event),
      published: event.published,
      pointsRemain: pointsState.pointsRemain,
      pointsAwarded: pointsState.pointsAwarded,
      organizers: event.organizers.map((entry) => EventService.#serializeOrganizer(entry))
    };
  }

  static #serializePublicEvent(event) {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      capacity: event.capacity,
      organizers: event.organizers.map((entry) => EventService.#serializeOrganizer(entry)),
      numGuests: EventService.#countGuests(event)
    };
  }

  static #serializeGuests(event) {
    return event.rsvps
      .filter((rsvp) => rsvp.status === RSVP_STATUS.RSVPED)
      .map((rsvp) => ({
        id: rsvp.user.id,
        utorid: rsvp.user.utorid,
        name: rsvp.user.name
      }));
  }
  static #filterNullishUpdates(updates) {
    return Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
  static #rejectImmutableUpdates(updates, fields) {
    for (const field of fields) {
      if (updates[field] !== undefined) {
        throw new EventError(400, "Cannot update event after start time.");
      }
    }
  }
}

module.exports = { EventService, EventError };
