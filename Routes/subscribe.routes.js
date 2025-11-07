const express = require("express");
const subscribeRouter = express.Router();
const subscribeController = require("../Controllers/subscribe.controller");

subscribeRouter.post("/", subscribeController.sendConfirmationEmail);

module.exports = subscribeRouter;
