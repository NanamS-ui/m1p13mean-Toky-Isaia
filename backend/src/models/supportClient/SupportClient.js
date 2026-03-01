const mongoose = require("mongoose");

const SupportClientSchema = new mongoose.Schema(
    {
        status_support_client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StatusSupportClient",
            required: true
        },
        type_support_client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TypeSupportClient",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },
        sujet: {
            type: String,
            required: true,
            trim: true
        },
        reponse: {
            type: String,
            default: null,
            trim: true
        },
        deleted_at: {
            type: Date,
            default: null
        }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports = mongoose.model("SupportClient", SupportClientSchema, "support_clients");