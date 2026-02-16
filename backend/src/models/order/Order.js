const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      required: true,
    },
    orderCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderCategory",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
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
OrderSchema.index({ deleted_at: 1 });
OrderSchema.virtual("orderItems", {
  ref: "OrderItem",
  localField: "_id",
  foreignField: "order"
});

OrderSchema.set("toObject", { virtuals: true });
OrderSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Order", OrderSchema, "orders");
