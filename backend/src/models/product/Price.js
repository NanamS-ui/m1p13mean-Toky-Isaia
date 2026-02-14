const mongoose = require("mongoose");

const PriceSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
      min: 0
    },
    started_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
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
 * Validation logique des dates
 */
PriceSchema.pre("save", function () {
  if (this.end_date <= this.started_date) {
    throw new Error("La date de fin doit être supérieure à la date de début");
  }
});

module.exports = mongoose.model(
  "Price",
  PriceSchema,
  "prices"
);
