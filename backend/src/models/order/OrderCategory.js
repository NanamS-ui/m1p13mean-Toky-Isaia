const mongoose = require("mongoose");

const OrderCategorySchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

OrderCategorySchema.index({ value: 1 }, { unique: true });

module.exports = mongoose.model(
  "OrderCategory",
  OrderCategorySchema,
  "order_categories"
);
