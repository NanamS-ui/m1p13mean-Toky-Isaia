const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    description: {
      type: String,
      trim: true,
      default: null
    },
    started_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      default: null
    },
    all_day: {
      type: Boolean,
      default: false
    },
    start_time: {
      type: String,
      trim: true,
      default: null
    },
    end_time: {
      type: String,
      trim: true,
      default: null
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventCategory",
      default: null
    },
    image_url: {
      type: String,
      trim: true,
      default: null
    },
    published: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
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

EventSchema.index({ started_date: 1 });
EventSchema.index({ end_date: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ published: 1 });
EventSchema.index({ deleted_at: 1 });

EventSchema.pre("save", function () {
  if (this.end_date && this.end_date < this.started_date) {
    throw new Error("La date de fin doit être supérieure ou égale à la date de début");
  }

  if (this.all_day) return;

  // Si non 'all day', on laisse start_time/end_time optionnels.
  // Si les deux sont présents ET que l'événement est sur une seule journée,
  // on impose end_time > start_time. Pour un événement multi-jours, on autorise
  // par exemple 20:00 → 06:00 le lendemain.
  if (this.start_time && this.end_time) {
    const isSameDayOrNoEndDate = !this.end_date || this.end_date <= this.started_date;
    if (isSameDayOrNoEndDate && this.end_time <= this.start_time) {
      throw new Error("L'heure de fin doit être supérieure à l'heure de début");
    }
  }
});

module.exports = mongoose.model("Event", EventSchema, "events");
