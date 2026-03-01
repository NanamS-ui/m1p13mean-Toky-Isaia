
const mongoose = require("mongoose");

const MessengerSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    deleted_at: {
      type: Date,
      default: null
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: "created_date",
      updatedAt: "updated_date"
    }
  }
);
MessengerSchema.index({
  sender: 1,
  recipient: 1,
  created_at: -1
})
module.exports = mongoose.model(
  "Messenger",
  MessengerSchema,
  "messengers"
);
