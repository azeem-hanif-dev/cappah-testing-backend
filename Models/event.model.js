const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    link: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
    },
    images: {
      type: [String],
    },
    schedule: {
      fromDate: {
        type: Date,
        required: true,
      },
      toDate: {
        type: Date,
        required: true,
      },
    },
    time: {
      type: String,
    },
    status: {
      type: String,
      enum: ["current", "upcoming", "past"],
      default: "upcoming",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Middleware to update status before saving
EventSchema.pre("save", function (next) {
  const now = new Date();
  if (now >= this.schedule.fromDate && now <= this.schedule.toDate) {
    this.status = "current";
  } else if (now < this.schedule.fromDate) {
    this.status = "upcoming";
  } else {
    this.status = "past";
  }
  next();
});

module.exports = mongoose.model("Event", EventSchema);
