const mongoose = require("mongoose");

const StockMouvementSchema = new mongoose.Schema(
  {
    in: {
      type: Number,
      default: 0,
      min: 0
    },
    out: {
      type: Number,
      default: 0,
      min: 0
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


StockMouvementSchema.index({ stock: 1 });
StockMouvementSchema.index({ deleted_at: 1 });

module.exports = mongoose.model(
  "StockMouvement",
  StockMouvementSchema,
  "stock_mouvements"
);
