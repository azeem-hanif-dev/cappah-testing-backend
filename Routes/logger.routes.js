const express = require("express");
const loggerRouter = express.Router();
const loggerController = require("../Controllers/logger.controller");
const { verifyJwt } = require("../Middlewares/verifyJwt.middleware");
const { verifyRole } = require("../Middlewares/verifyRole.middleware");

loggerRouter.get(
  "/get-all",
  verifyJwt,
  verifyRole("superAdmin"),
  loggerController.getAllLogs
);

module.exports = loggerRouter;
