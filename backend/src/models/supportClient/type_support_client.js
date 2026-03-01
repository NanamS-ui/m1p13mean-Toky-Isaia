
const mongoose = require("mongoose");

const TypeSupportClientSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

// Index unique sur value
TypeSupportClientSchema.index({ value: 1 }, { unique: true });

module.exports = mongoose.model(
  "TypeSupportClient",
  TypeSupportClientSchema,
  "type_support_clients"
);