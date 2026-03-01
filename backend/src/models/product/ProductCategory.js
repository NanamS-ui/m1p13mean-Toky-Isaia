const mongoose = require("mongoose");

const ProductCategorySchema = new mongoose.Schema(
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

ProductCategorySchema.index({ value: 1 }, { unique: true });

module.exports = mongoose.model(
  "ProductCategory",
  ProductCategorySchema,
  "product_categories"
);
