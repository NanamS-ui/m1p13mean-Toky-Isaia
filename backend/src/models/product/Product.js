const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    product_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

ProductSchema.index({ name: 1 });
ProductSchema.index({ product_category: 1 });

module.exports = mongoose.model("Product", ProductSchema, "products");
