const fs = require("fs");
const path = require("path");
const Logger = require("../Models/logger.model");

// Define the log file path
const logFilePath = path.join(__dirname, "../server_logger.txt");

// Logging Middleware
const loggerMiddleware = async (req, res, next) => {
  // Check if req.admin and req.admin.username exist
  const username =
    req.admin && req.admin.username ? req.admin.username : "Not found";

  try {
    const logData = {
      method: req.method,
      route: req.originalUrl,
      user: req.headers["user-agent"],
      username,
      ip: req.ip,
      timestamp: new Date(),
      statusCode: res.statusCode,
    };

    const logString = `${logData.user} ${logData.username} ${logData.ip} ${logData.route} ${logData.method} ${logData.statusCode} ${logData.timestamp} \n`;

    // Append the log to the log file
    fs.appendFile(logFilePath, logString, (err) => {
      if (err) {
        console.error("Error writing log to file:", err);
      }
    });

    // Save log to MongoDB using Mongoose
    try {
      const newLogger = new Logger(logData);
      await newLogger.save();
    } catch (err) {
      console.error("Error writing log to DB:", err);
    }

    console.log(
      `Logged ${logData.method} ${logData.route} at ${logData.timestamp}`
    );
    next();
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

module.exports = loggerMiddleware;
