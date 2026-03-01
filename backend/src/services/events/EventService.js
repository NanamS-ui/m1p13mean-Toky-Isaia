const mongoose = require("mongoose");
const Event = require("../../models/events/Event");
const EventCategoryService = require("./EventCategoryService");
const UploadService = require("../UploadService");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const isObjectId = (value) =>
  typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(d.getTime())) return null;
  return d;
};

const resolveCategoryId = async (category) => {
  if (!category) return null;

  if (isObjectId(category)) return category;

  const found = await EventCategoryService.getEventCategoryByValue(category);
  if (!found) {
    throw buildError("Catégorie d'événement invalide", 400);
  }
  return found._id;
};

const normalizeCreatePayload = async (payload, userId) => {
  const started_date = parseDate(payload.started_date ?? payload.startDate);
  if (!started_date) throw buildError("Date de début invalide", 400);

  const end_date = parseDate(payload.end_date ?? payload.endDate);
  const all_day = Boolean(payload.all_day ?? payload.allDay);

  const start_time = payload.start_time ?? payload.startTime ?? null;
  const end_time = payload.end_time ?? payload.endTime ?? null;

  const categoryId = await resolveCategoryId(payload.category);

  let image_url = payload.image_url ?? null;
  if (payload.image) {
    const upload = await UploadService.uploadToCloudinary(payload.image, "events");
    image_url = upload.url;
  }

  return {
    title: payload.title,
    description: payload.description ?? null,
    started_date,
    end_date: end_date ?? null,
    all_day,
    start_time: all_day ? null : (start_time || null),
    end_time: all_day ? null : (end_time || null),
    category: categoryId,
    image_url,
    published: Boolean(payload.published ?? false),
    created_by: userId ?? null
  };
};

const normalizeUpdatePayload = async (payload) => {
  const update = { ...payload };

  // Accept camelCase from frontend
  if (update.startDate !== undefined) {
    update.started_date = update.startDate;
    delete update.startDate;
  }
  if (update.endDate !== undefined) {
    update.end_date = update.endDate;
    delete update.endDate;
  }
  if (update.allDay !== undefined) {
    update.all_day = update.allDay;
    delete update.allDay;
  }
  if (update.startTime !== undefined) {
    update.start_time = update.startTime;
    delete update.startTime;
  }
  if (update.endTime !== undefined) {
    update.end_time = update.endTime;
    delete update.endTime;
  }

  if (update.started_date !== undefined) {
    const d = parseDate(update.started_date);
    if (!d) throw buildError("Date de début invalide", 400);
    update.started_date = d;
  }

  if (update.end_date !== undefined) {
    const d = parseDate(update.end_date);
    if (update.end_date && !d) throw buildError("Date de fin invalide", 400);
    update.end_date = d;
  }

  if (update.category !== undefined) {
    update.category = await resolveCategoryId(update.category);
  }

  if (update.image) {
    const upload = await UploadService.uploadToCloudinary(update.image, "events");
    update.image_url = upload.url;
    delete update.image;
  }

  if (update.all_day === true) {
    update.start_time = null;
    update.end_time = null;
  }

  return update;
};

const createEvent = async (payload, userId) => {
  if (!payload?.title) throw buildError("Titre requis", 400);

  const data = await normalizeCreatePayload(payload, userId);
  const created = await Event.create(data);
  return Event.findById(created._id).populate("category");
};

const getEvents = async (options = {}) => {
  const filter = { deleted_at: null };
  if (options.published !== undefined) {
    filter.published = options.published;
  }

  return Event.find(filter)
    .populate("category")
    .sort({ started_date: -1 });
};

const getEventById = async (id) => {
  const event = await Event.findOne({ _id: id, deleted_at: null }).populate("category");
  if (!event) throw buildError("Événement introuvable", 404);
  return event;
};

const updateEvent = async (id, payload) => {
  const update = await normalizeUpdatePayload(payload);
  const event = await Event.findOneAndUpdate(
    { _id: id, deleted_at: null },
    update,
    { new: true, runValidators: true }
  ).populate("category");

  if (!event) throw buildError("Événement introuvable", 404);
  return event;
};

const deleteEvent = async (id) => {
  const event = await Event.findOneAndUpdate(
    { _id: id, deleted_at: null },
    { deleted_at: new Date() },
    { new: true }
  );

  if (!event) throw buildError("Événement introuvable", 404);
  return event;
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
};
