const mongoose = require("mongoose");

const UserStatusSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
      unique: true
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

module.exports = mongoose.model("UserStatus", UserStatusSchema, "user_status");