const ShopStatus = require("../models/ShopStatus");
const buildError = require("../utils/buildError");


const createShopStatus = async (data) => {
  return await ShopStatus.create(data);
};


const getShopStatuses = async () => {
  return await ShopStatus.find();
};


const getShopStatusById = async (id) => {
  const status = await ShopStatus.findById(id);
  if (!status) throw buildError("Statut introuvable", 404);
  return status;
};


const updateShopStatus = async (id, data) => {
  const status = await ShopStatus.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });
  if (!status) throw buildError("Statut introuvable", 404);
  return status;
};


const deleteShopStatus = async (id) => {
  const status = await ShopStatus.findByIdAndDelete(id);
  if (!status) throw buildError("Statut introuvable", 404);
  return status;
};

const getStatusByValue = async (value) => {
  if (!value || typeof value !== "string") {
    throw { status: 400, message: "Invalid status value" };
  }

  const status = await ShopStatus.findOne({
    value: value.trim()
  });

  if (!status) {
    throw { status: 404, message: "Status not found" };
  }

  return status;
};

module.exports = {
  createShopStatus,
  getShopStatuses,
  getShopStatusById,
  updateShopStatus,
  deleteShopStatus,
  getStatusByValue
};
