const mongoose = require("mongoose");

const StatusSupportClientSchema = new mongoose.Schema(
    {
        value: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: false }
);

StatusSupportClientSchema.index({ value: 1 }, { unique: true });

module.exports = mongoose.model("StatusSupportClient", StatusSupportClientSchema, "status_support_clients");