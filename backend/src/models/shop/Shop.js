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
const OpeningHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "LUNDI",
        "MARDI",
        "MERCREDI",
        "JEUDI",
        "VENDREDI",
        "SAMEDI",
        "DIMANCHE"
      ],
      required: true
    },
    heure_debut: {
      type: String,
      required: true
    },
    heure_fin: {
      type: String,
      required: true
    }
  },
  { _id: false }
);


const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: {
      type: String,
      trim: true
    },
    is_accepted: {
      type: Boolean,
      default: false
    },
    suspensions: {
      type: [SuspensionSchema],
      default: []
    },
    opening_hours:{
      type: [OpeningHourSchema],
      default: () => [
        { day: "LUNDI", heure_debut: "09:00", heure_fin: "19:00" },
        { day: "MARDI", heure_debut: "09:00", heure_fin: "19:00" },
        { day: "MERCREDI", heure_debut: "09:00", heure_fin: "19:00" },
        { day: "JEUDI", heure_debut: "09:00", heure_fin: "19:00" },
        { day: "VENDREDI", heure_debut: "09:00", heure_fin: "19:00" },
        { day: "SAMEDI", heure_debut: "09:00", heure_fin: "19:00" },
        { day: "DIMANCHE", heure_debut: "09:00", heure_fin: "19:00" }
      ]
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    door: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Door",
      required: true
    },
    shop_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShopCategory",
      required: true
    },
    shop_status:{
      type : mongoose.Schema.Types.ObjectId,
      ref: "ShopStatus",
      required: true
    },
    owner:{
      type : mongoose.Schema.Types.ObjectId,
      ref : "Users",
      required : true
    },
    validate_date: {
      type: Date,
      default: null
    },
    deleted_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

ShopSchema.index({ name: 1 }, { unique: true });
ShopSchema.index({ shop_category: 1 });
ShopSchema.index({shop_status : 1});
ShopSchema.index({ owner : 1});
ShopSchema.index({ door: 1 });;
ShopSchema.index({ deleted_at: 1 });
ShopSchema.index({ validate_date: 1 });



module.exports = mongoose.model("Shop", ShopSchema, "shops");
