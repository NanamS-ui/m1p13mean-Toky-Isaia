const Shop = require("../../models/shop/Shop");
const User = require("../../models/user/User");
const ShopStatus = require("../../models/shop/ShopStatus")
const ShopStatusService = require("./ShopStatusService");
const mongoose = require("mongoose");
const buildError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createShopWithProprietaire = async (payload) =>{
  defaultStatus = await ShopStatus.findOne({ value: "Active"});
  if( !defaultStatus) throw buildError("Status 'En attente' introuvable", 500);
  return Shop.create({
    ...payload,
    shop_status: defaultStatus._id,
  });
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

const getActiveShops = async (floor, category) => {
  const activeStatus = await ShopStatusService.getStatusByValue("Active");
  
  const query = { deleted_at: null, shop_status: activeStatus._id };
  
  // Ajouter le filtre par étage si fourni
  if (floor && floor !== "ALL") {
    const Floor = require("../../models/shop/Floor");
    const Door = require("../../models/shop/Door");
    
    // Chercher les Floors avec une valeur correspondant au filtre (matching de nombres entiers)
    const floors = await Floor.find({ value: { $regex: `\\b${floor}\\b`, $options: 'i' } });
    const floorIds = floors.map(f => f._id);
    
    // Chercher les Doors avec ces Floors
    const doors = await Door.find({ floor: { $in: floorIds } });
    const doorIds = doors.map(d => d._id);
    query.door = { $in: doorIds };
  }
  
  // Ajouter le filtre par catégorie si fourni
  if (category && category !== "ALL") {
    query.shop_category = category;
  }
  
  return Shop.find(query)
    .populate({ path: "door", populate: { path: "floor" } })
    .populate("shop_status")
    .populate("owner")
    .populate("shop_category");
};

const getTopShopsPublic = async (limit = 10) => {
  const activeStatus = await ShopStatusService.getStatusByValue("Active");
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 10;

  const rows = await Shop.aggregate([
    { $match: { deleted_at: null, shop_status: activeStatus._id } },
    {
      $lookup: {
        from: "shop_reviews",
        localField: "_id",
        foreignField: "shop",
        as: "reviews"
      }
    },
    {
      $addFields: {
        ratingCount: { $size: "$reviews" },
        avgRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $avg: "$reviews.rating" },
            0
          ]
        }
      }
    },
    { $sort: { avgRating: -1, ratingCount: -1, name: 1 } },
    { $limit: safeLimit },
    {
      $lookup: {
        from: "shop_categories",
        localField: "shop_category",
        foreignField: "_id",
        as: "shop_category_doc"
      }
    },
    { $addFields: { shop_category: { $arrayElemAt: ["$shop_category_doc", 0] } } },
    {
      $project: {
        _id: 1,
        name: 1,
        logo: 1,
        description: 1,
        avgRating: "$avgRating",
        ratingCount: 1,
        shop_category: {
          _id: "$shop_category._id",
          value: "$shop_category.value"
        }
      }
    }
  ]);

  return rows;
};

const getShopById = async (id) => {
  const shop = await Shop.findOne({ _id: id, deleted_at: null })
    .populate({
      path: "door",
      populate: {
        path: "floor"
      }
    })
    .populate("shop_status")
    .populate("owner")
    .populate("shop_category");
  if (!shop) throw buildError("Boutique introuvable", 404);
  return shop;
};
const getByIdOwner = async (idOwner) =>{
  
  if (!mongoose.Types.ObjectId.isValid(idOwner)) {
      throw { status: 400, message: "Invalid owner ID" };
  }
  const shops = await Shop.find({owner : idOwner})
  .populate("door")
    .populate("shop_status")
    .populate("owner")
    .populate("shop_category");
  
  return shops;
}
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

const getFavoriteShopIdsByUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw buildError("Utilisateur invalide", 400);
  }

  const user = await User.findById(userId).select("favorite_shops");
  if (!user) throw buildError("Utilisateur introuvable", 404);

  return (user.favorite_shops || []).map((id) => id.toString());
};

const getFavoriteShopsByUser = async (userId) => {
  const favoriteIds = await getFavoriteShopIdsByUser(userId);
  if (favoriteIds.length === 0) return [];

  return Shop.find({
    _id: { $in: favoriteIds },
    deleted_at: null
  })
    .populate({ path: "door", populate: { path: "floor" } })
    .populate("shop_status")
    .populate("owner")
    .populate("shop_category");
};

const addFavoriteShop = async (userId, shopId) => {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw buildError("Boutique invalide", 400);
  }

  const shop = await Shop.findOne({ _id: shopId, deleted_at: null }).select("_id");
  if (!shop) throw buildError("Boutique introuvable", 404);

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorite_shops: shop._id } },
    { new: true }
  ).select("favorite_shops");

  if (!user) throw buildError("Utilisateur introuvable", 404);

  return (user.favorite_shops || []).map((id) => id.toString());
};

const removeFavoriteShop = async (userId, shopId) => {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw buildError("Boutique invalide", 400);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favorite_shops: new mongoose.Types.ObjectId(shopId) } },
    { new: true }
  ).select("favorite_shops");

  if (!user) throw buildError("Utilisateur introuvable", 404);

  return (user.favorite_shops || []).map((id) => id.toString());
};

const isFavoriteShop = async (userId, shopId) => {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw buildError("Boutique invalide", 400);
  }

  const user = await User.findById(userId).select("favorite_shops");
  if (!user) throw buildError("Utilisateur introuvable", 404);

  const favoriteSet = new Set((user.favorite_shops || []).map((id) => id.toString()));
  return favoriteSet.has(shopId.toString());
};

module.exports = {
  createShop,
  getShops,
  getActiveShops,
  getTopShopsPublic,
  getShopById,
  updateShop,
  deleteShop,
  addSuspension,
  updateShopStatus,
  getByIdOwner,
  createShopWithProprietaire,
  getFavoriteShopIdsByUser,
  getFavoriteShopsByUser,
  addFavoriteShop,
  removeFavoriteShop,
  isFavoriteShop
};
