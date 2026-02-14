const Tag = require("../../models/product/Tag");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createTag = async (payload) => {
  return Tag.create(payload);
};

const getTags = async () => {
  return Tag.find({ deleted_at: null });
};

const getTagById = async (id) => {
  const tag = await Tag.findOne({ _id: id, deleted_at: null });
  if (!tag) throw buildError("Tag introuvable", 404);
  return tag;
};

const updateTag = async (id, payload) => {
  const tag = await Tag.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  );

  if (!tag) throw buildError("Tag introuvable", 404);
  return tag;
};

const deleteTag = async (id) => {
  const tag = await Tag.findOneAndUpdate(
    { _id: id, deleted_at: null },
    { deleted_at: new Date() },
    { new: true }
  );

  if (!tag) throw buildError("Tag introuvable", 404);
  return tag;
};

module.exports = {
  createTag,
  getTags,
  getTagById,
  updateTag,
  deleteTag
};
