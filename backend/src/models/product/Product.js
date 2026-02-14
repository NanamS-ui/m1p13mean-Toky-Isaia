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
      trim: true,
      required: true
    },
    reference : {
      type: String,
      trim: true,
      required: true
    },
    poids : {
      type: Number,
      required: true
    },
    dimension:{
      type:String,
      trim: true,
      required: true
    },
    image: {
      type: String,
      trim: true
    },
    product_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag"
      }
    ]
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
