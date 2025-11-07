const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      // unique: true,
    },
    permissions: {
      product: {
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        statusChange: { type: Boolean, default: false },
      },
      category: {
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
      },
      subCategory: {
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
      },
      event: {
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        statusChange: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Permission", permissionSchema);
