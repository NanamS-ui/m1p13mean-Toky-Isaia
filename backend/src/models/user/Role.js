const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    val: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: false }
);

RoleSchema.index({ val: 1 }, { unique: true });

module.exports = mongoose.model("Role", RoleSchema);
