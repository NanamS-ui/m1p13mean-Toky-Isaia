const mongoose = require("mongoose");

const SuspensionSchema = new mongoose.Schema(
  {
    started_date: {
      type: Date
    },
    end_date: {
      type: Date
    },
    description: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const LoginHistorySchema = new mongoose.Schema(
  {
    login_date: {
      type: Date
    },
    logout_date: {
      type: Date
    }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    adresse: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    password: {
      type: String
    },
    is_verified: {
      type: Boolean,
      default: false
    },
    email_verification_code: {
      type: String,
      default: null
    },
    email_verification_expires: {
      type: Date,
      default: null
    },
    refresh_token_hash: {
      type: String,
      default: null
    },
    is_deleted: {
      type: Date,
      default: null
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true
    },
    suspensions: {
      type: [SuspensionSchema],
      default: []
    },
    login_history: {
      type: [LoginHistorySchema],
      default: []
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ phone: 1 });

module.exports = mongoose.model("Users", UserSchema);
