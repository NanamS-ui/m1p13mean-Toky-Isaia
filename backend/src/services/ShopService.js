const Shop = require("../models/Shop");
const ShopStatus = require("../models/ShopStatus")
const ShopStatusService = require("./ShopStatusService");
const mongoose = require("mongoose");
const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createShop = async (payload, userId) =>{
  defaultStatus = await ShopStatus.findOne({ value: "En attente"});
  if( !defaultStatus) throw buildError("Status 'En attente' introuvable", 500);
  return Shop.create({
    ...payload,
    shop_status: defaultStatus._id,
    owner: userId
  });
  // Shop.create(payload);
};

const getShops = async () =>
  Shop.find({ deleted_at: null })
    .populate({ path: "door", populate: { path: "floor" } })
    .populate("shop_status")
    .populate("owner")
    .populate("shop_category");

const getShopById = async (id) => {
  const shop = await Shop.findOne({ _id: id, deleted_at: null })
    .populate("door")
    .populate("shop_status")
    .populate("owner")
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
    .populate("shop_status")
    .populate("owner")
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

const updateShopStatus = async (status_value, id_shop) => {
  console.log(status_value);
  if (!mongoose.Types.ObjectId.isValid(id_shop)) {
    throw { status: 400, message: "Invalid shop id" };
  }
  const status = await ShopStatusService.getStatusByValue(status_value);
  
  const updateData = {
    shop_status: status._id
  };

  if (status.value === "Active") {
    updateData.validate_date = new Date();
  }

  const updatedShop = await Shop.findByIdAndUpdate(
    id_shop,
    { $set: updateData },
    { new: true }
  ).populate("door")
    .populate("shop_status")
    .populate("owner")
    .populate("shop_category");

  if (!updatedShop) {
    throw { status: 404, message: "Shop not found" };
  }

  return updatedShop;
};

module.exports = {
  createShop,
  getShops,
  getShopById,
  updateShop,
  deleteShop,
  addSuspension,
  updateShopStatus
};
