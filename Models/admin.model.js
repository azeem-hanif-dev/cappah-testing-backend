const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      maxLength: 28,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      match: /.+\@.+\..+/,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Others"],
      default: "Male",
    },
    role: {
      type: String,
      required: true,
      default: "Member",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDelete: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value) {
          // Check if the date is in the past
          return value < Date.now();
        },
        message: "Date of birth must be in the past.",
      },
      min: "1900-01-01",
      max: Date.now(),
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
