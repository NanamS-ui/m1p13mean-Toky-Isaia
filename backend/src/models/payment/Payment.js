const mongoose = require("mongoose");

const BankDetailsSchema = new mongoose.Schema(
  {
    bank_name: {
      type: String,
      trim: true,
      default: null
    },
    account_holder: {
      type: String,
      trim: true,
      default: null
    },
    account_number: {
      type: String,
      trim: true,
      default: null
    },
    note: {
      type: String,
      trim: true,
      default: null
    }
  },
  { _id: false }
);

const PaymentSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["bank_transfer"],
      default: "bank_transfer",
      trim: true
    },

    method: {
      type: String,
      required: true,
      enum: ["BANK_TRANSFER"],
      default: "BANK_TRANSFER"
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: "mga",
      lowercase: true,
      trim: true
    },

    status: {
      type: String,
      required: true,
      enum: [
        "WAITING_CONFIRMATION",
        "CONFIRMED",
        "IN_PREPARATION",
        "SHIPPED",
        "DELIVERY_EFFECTED",
        "REJECTED"
      ],
      default: "WAITING_CONFIRMATION"
    },

    bank_details: {
      type: BankDetailsSchema,
      default: null
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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

PaymentSchema.index({ deleted_at: 1 });
PaymentSchema.index({ user: 1, created_at: -1 });
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", PaymentSchema, "payments");
