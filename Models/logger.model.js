const mongoose = require("mongoose");

const loggerSchema = new mongoose.Schema({
  method: {
    type: String,
  },
  route: {
    type: String,
  },
  user: {
    type: String,
  },
  username: {
    type: String,
  },
  ip: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  statusCode: {
    type: Number,
  },
});

const Logger = mongoose.model("Logger", loggerSchema);

module.exports = Logger;
