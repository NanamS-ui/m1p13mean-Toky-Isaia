const mongoose = require("mongoose");

const ShopStatusSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: false
  }
);

ShopStatusSchema.index({ value: 1 }, { unique: true });

module.exports = mongoose.model("ShopStatus", ShopStatusSchema, "shop_status");
