const ServiceCenter = require("../../models/config/ServiceCenter");
const buildError = require("../../utils/buildError");

const createServiceCenter = async (data) => {
  return ServiceCenter.create(data);
};

const getServiceCenters = async () => {
  return ServiceCenter.find().sort({ createdAt: -1 });
};

const getServiceCenterById = async (id) => {
  const item = await ServiceCenter.findById(id);
  if (!item) throw buildError("Configuration introuvable", 404);
  return item;
};

const updateServiceCenter = async (id, data) => {
  const item = await ServiceCenter.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!item) throw buildError("Configuration introuvable", 404);
  return item;
};

const deleteServiceCenter = async (id) => {
  const item = await ServiceCenter.findByIdAndDelete(id);
  if (!item) throw buildError("Configuration introuvable", 404);
  return item;
};

module.exports = {
  createServiceCenter,
  getServiceCenters,
  getServiceCenterById,
  updateServiceCenter,
  deleteServiceCenter
};
