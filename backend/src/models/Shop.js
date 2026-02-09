const mongoose = require("mongoose");

const SuspensionSchema = new mongoose.Schema(
  {
    started_date: {
      type: Date
    },
    end_date: {
      type: Date
    },
    description: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: {
      type: String,
      trim: true
    },
    is_accepted: {
      type: Boolean,
      default: false
    },
    suspensions: {
      type: [SuspensionSchema],
      default: []
    },
    door: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Door",
      required: true
    },
    shop_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopCategory",
      required: true
    },
    deleted_at: {
      type: Date,
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

ShopSchema.index({ name: 1 }, { unique: true });
ShopSchema.index({ shop_category: 1 });


module.exports = mongoose.model("Shop", ShopSchema, "shops");
