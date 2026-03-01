const mongoose = require("mongoose");

const ServiceCenterSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceCenter", ServiceCenterSchema, "service_centers");
