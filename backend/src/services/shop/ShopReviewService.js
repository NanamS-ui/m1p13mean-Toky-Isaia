const ShopReview = require("../../models/shop/ShopReview");
const Shop = require("../../models/shop/Shop");
const mongoose = require("mongoose");
const buildError = (message, status = 400) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const createShopReview = async (payload) => {
  return await ShopReview.create(payload);
};

const getShopReviews = async () => {
  return await ShopReview.find().populate("user").populate("shop");
};

const getShopReviewById = async (id) => {
  const review = await ShopReview.findById(id).populate("user").populate("shop");
  if (!review) throw buildError("Avis introuvable", 404);
  return review;
};

const updateShopReview = async (id, payload) => {
  const review = await ShopReview.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true
  });
  if (!review) throw buildError("Avis introuvable", 404);
  return review;
};

const deleteShopReview = async (id) => {
  const review = await ShopReview.findByIdAndDelete(id);
  if (!review) throw buildError("Avis introuvable", 404);
  return review;
};

const getShopReviewsByOwner = async (ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw buildError("OwnerId invalide", 400);
  }

  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const reviews = await ShopReview.aggregate([
    {
      $lookup: {
        from: "shops",
        localField: "shop",
        foreignField: "_id",
        as: "shop"
      }
    },
    { $unwind: "$shop" },
    { $match: { "shop.owner": ownerObjectId } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        rating: 1,
        comment: 1,
        response: 1,
        created_at: 1,
        updated_at: 1,
        user: { _id: 1, name: 1, email: 1 },
        shop: { _id: 1, name: 1 }
      }
    }
  ]);

  return reviews;
};
const getShopReviewsByShop = async (shopId) => {
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw buildError("shopId invalide", 400);
  }

  const shopObjectId = new mongoose.Types.ObjectId(shopId);

  const reviews = await ShopReview.aggregate([
    {
      $lookup: {
        from: "shops",
        localField: "shop",
        foreignField: "_id",
        as: "shop"
      }
    },
    { $unwind: "$shop" },
    { $match: { "shop._id": shopObjectId } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        rating: 1,
        comment: 1,
        response: 1,
        created_at: 1,
        updated_at: 1,
        user: { _id: 1, name: 1, email: 1 },
        shop: { _id: 1, name: 1 }
      }
    }
  ]);

  return reviews;
};
module.exports = {getShopReviewsByShop,
  createShopReview,
  getShopReviews,
  getShopReviewById,
  updateShopReview,
  deleteShopReview,
  getShopReviewsByOwner
};
