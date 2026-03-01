const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    target: {
      type: String,
      enum: ["all", "acheteurs", "boutiques", "custom"],
      default: "all"
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
      }
    ],
    read_by: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users"
        },
        read_at: {
          type: Date,
          default: Date.now
        }
      }
    ],
    sent_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users"
    },
    is_sent: {
      type: Boolean,
      default: false
    },
    sent_at: Date,
    // Champs optionnels pour lier les notifications aux objets système
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },
    order_status: {
      type: String,
      enum: ["En attente", "Confirmée", "En préparation", "Livrée", "Annulée"],
      default: null
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

NotificationSchema.index({ created_at: -1 });
NotificationSchema.index({ target: 1 });
NotificationSchema.index({ is_sent: 1 });
NotificationSchema.index({ "recipients._id": 1 });
NotificationSchema.index({ order_id: 1 });
NotificationSchema.index({ order_status: 1 });

module.exports = mongoose.model("Notification", NotificationSchema, "notifications");
