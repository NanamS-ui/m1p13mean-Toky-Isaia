const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true
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

TagSchema.index({ value: 1 }, { unique: true });
TagSchema.index({ deleted_at: 1 });

module.exports = mongoose.model(
  "Tag",
  TagSchema,
  "tags"
);
