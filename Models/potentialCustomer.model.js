const mongoose = require("mongoose");

const potentialCustomerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Store email in lowercase
      validate: {
        validator: function (v) {
          return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid email format!`,
      },
    },
    source: {
      type: String,
      enum: ["subscribe", "enquire", "get-in-touch"],
      default: "subscribe",
    },
    visitCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PotentialCustomer", potentialCustomerSchema);
