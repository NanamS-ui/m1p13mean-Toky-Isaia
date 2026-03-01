const mongoose = require("mongoose");

const EventCategorySchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true
    },
    label: {
      type: String,
      trim: true,
      default: null
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

EventCategorySchema.index({ value: 1 }, { unique: true });
EventCategorySchema.index({ deleted_at: 1 });

module.exports = mongoose.model(
  "EventCategory",
  EventCategorySchema,
  "event_categories"
);
