const Shop = require("../models/Shop");

const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createShop = async (payload) => Shop.create(payload);

const getShops = async () =>
  Shop.find({ deleted_at: null })
    .populate("door")
    .populate("shop_category");

const getShopById = async (id) => {
  const shop = await Shop.findOne({ _id: id, deleted_at: null })
    .populate("door")
    .populate("shop_category");
  if (!shop) throw buildError("Boutique introuvable", 404);
  return shop;
};

const updateShop = async (id, payload) => {
  const shop = await Shop.findOneAndUpdate(
    { _id: id, deleted_at: null },
    payload,
    { new: true, runValidators: true }
  )
    .populate("door")
    .populate("shop_category");
  if (!shop) throw buildError("Boutique introuvable", 404);
  return shop;
};

const deleteShop = async (id) => {
  const shop = await Shop.findOneAndUpdate(
    { _id: id },
    { deleted_at: new Date() },
    { new: true }
  );
  if (!shop) throw buildError("Boutique introuvable", 404);
  return shop;
};

const addSuspension = async (id, suspension) => {
  const shop = await Shop.findByIdAndUpdate(
    id,
    { $push: { suspensions: suspension } },
    { new: true, runValidators: true}
  );
  if (!shop) throw buildError("Boutique introuvable", 404);
  return shop;
};

module.exports = {
  createShop,
  getShops,
  getShopById,
  updateShop,
  deleteShop,
  addSuspension
};
