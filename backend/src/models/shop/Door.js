const mongoose = require("mongoose");

const DoorSchema = new mongoose.Schema(
    {
        value: {
            type: String,
            required: true,
            trim: true
        },
        floor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Floor",
            required: true
        }
    },
    { timestamps: false }
);

DoorSchema.index({ value: 1, floor: 1 }, { unique: true });

module.exports = mongoose.model("Door", DoorSchema, "doors");
