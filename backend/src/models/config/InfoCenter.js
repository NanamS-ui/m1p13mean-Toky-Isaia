const mongoose = require("mongoose");

const OpeningHourSchema = new mongoose.Schema(
  {
    day: { type: String, required: true, trim: true },
    hours: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const InfoCenterSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    address: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
      full: { type: String, trim: true, default: "" }
    },
    contact: {
      phone: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" }
    },
    hoursSummary: { type: String, trim: true, default: "" },
    openingHours: { type: [OpeningHourSchema], default: [] },
    footerHours: { type: [OpeningHourSchema], default: [] },
    parkingInfo: { type: String, trim: true, default: "" },
    transportInfo: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InfoCenter", InfoCenterSchema, "info_centers");
