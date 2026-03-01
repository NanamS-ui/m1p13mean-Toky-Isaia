const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    unit_price: {
      type: Number,
      required: true,
    },
    promotion_percentage: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
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

// Index pour soft delete
OrderItemSchema.index({ deleted_at: 1 });
OrderItemSchema.index({ created_at: 1});
OrderItemSchema.index({ stock: 1 });

module.exports = mongoose.model("OrderItem", OrderItemSchema, "order_items");
