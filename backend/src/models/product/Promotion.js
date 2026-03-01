const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    percent: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true
    },
    started_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
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

/**
 * Validation logique
 */
PromotionSchema.pre("save", function () {
  if (this.end_date <= this.started_date) {
    throw new Error("La date de fin doit être supérieure à la date de début");
  }
});

module.exports = mongoose.model(
  "Promotion",
  PromotionSchema,
  "promotions"
);
