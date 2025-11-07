const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    textField: {
      type: String,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      trim: true,
    },
  },
  { timestamps: true }
);

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
