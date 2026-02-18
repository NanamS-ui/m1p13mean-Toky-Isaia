const mongoose = require("mongoose");

const ShopReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true
    },
    response: {
      type: String,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

module.exports = mongoose.model("ShopReview", ShopReviewSchema, "shop_reviews");
