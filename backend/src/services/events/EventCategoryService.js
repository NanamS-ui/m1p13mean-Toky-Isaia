const EventCategory = require("../../models/events/EventCategory");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createEventCategory = async (payload) => {
  const data = {
    value: payload?.value,
    label: payload?.label ?? null
  };

  if (!data.value) throw buildError("value requis", 400);

  return EventCategory.create(data);
};

const getEventCategories = async () => {
  return EventCategory.find({ deleted_at: null }).sort({ value: 1 });
};

const getEventCategoryById = async (id) => {
  const category = await EventCategory.findOne({ _id: id, deleted_at: null });
  if (!category) throw buildError("Catégorie introuvable", 404);
  return category;
};

const getEventCategoryByValue = async (value) => {
  if (!value) return null;
  return EventCategory.findOne({ value, deleted_at: null });
};

const getOrCreateEventCategoryByValue = async (value, label = null) => {
  if (!value) throw buildError("value requis", 400);

  const existing = await getEventCategoryByValue(value);
  if (existing) return existing;

  return EventCategory.create({
    value,
    label
  });
};

const updateEventCategory = async (id, payload) => {
  const category = await EventCategory.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  );

  if (!category) throw buildError("Catégorie introuvable", 404);
  return category;
};

const deleteEventCategory = async (id) => {
  const category = await EventCategory.findOneAndUpdate(
    { _id: id, deleted_at: null },
    { deleted_at: new Date() },
    { new: true }
  );

  if (!category) throw buildError("Catégorie introuvable", 404);
  return category;
};

module.exports = {
  createEventCategory,
  getEventCategories,
  getEventCategoryById,
  getEventCategoryByValue,
  getOrCreateEventCategoryByValue,
  updateEventCategory,
  deleteEventCategory
};
