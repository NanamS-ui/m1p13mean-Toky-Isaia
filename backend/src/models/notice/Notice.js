const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["shop", "product"],
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      required: true
    },
    status: {
      type: String,
      enum: ["published", "pending"],
      default: "published"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null
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

NoticeSchema.index({ user: 1, created_at: -1 });
NoticeSchema.index({ shop: 1, created_at: -1 });
NoticeSchema.index({ product: 1, created_at: -1 });
NoticeSchema.index({ order: 1 });

NoticeSchema.pre("validate", function () {
  const type = String(this.type || "");

  if (type === "shop") {
    if (!this.shop) throw new Error("shop est requis pour un avis boutique");
    this.product = null;
  }

  if (type === "product") {
    if (!this.product) throw new Error("product est requis pour un avis produit");
    // shop est optionnel mais utile pour afficher "chez ..."
  }
});

module.exports = mongoose.model("Notice", NoticeSchema, "notices");
