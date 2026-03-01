const mongoose = require("mongoose");

const FloorSchema = new mongoose.Schema(
    {
        value: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: false }
);

FloorSchema.index({ value: 1 }, { unique: true });

module.exports = mongoose.model("Floor", FloorSchema, "floors");
