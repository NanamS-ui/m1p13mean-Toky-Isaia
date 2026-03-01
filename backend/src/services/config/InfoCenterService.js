const InfoCenter = require("../../models/config/InfoCenter");
const buildError = require("../../utils/buildError");

const createInfoCenter = async (data) => {
  return InfoCenter.create(data);
};

const getInfoCenters = async () => {
  return InfoCenter.find().sort({ createdAt: -1 });
};

const getInfoCenterById = async (id) => {
  const item = await InfoCenter.findById(id);
  if (!item) throw buildError("Configuration introuvable", 404);
  return item;
};

const updateInfoCenter = async (id, data) => {
  const item = await InfoCenter.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!item) throw buildError("Configuration introuvable", 404);
  return item;
};

const deleteInfoCenter = async (id) => {
  const item = await InfoCenter.findByIdAndDelete(id);
  if (!item) throw buildError("Configuration introuvable", 404);
  return item;
};

module.exports = {
  createInfoCenter,
  getInfoCenters,
  getInfoCenterById,
  updateInfoCenter,
  deleteInfoCenter
};
