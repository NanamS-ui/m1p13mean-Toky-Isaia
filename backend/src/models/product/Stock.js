const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema(
  {
    in: {
      type: Number,
      required: true,
      min: 0
    },
    out: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    reste: {
      type: Number,
      default: 0
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
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
 * Calcul automatique du reste
 */
StockSchema.pre("save", function () {
  this.reste = this.in - this.out;
});

module.exports = mongoose.model(
  "Stock",
  StockSchema,
  "stocks"
);
