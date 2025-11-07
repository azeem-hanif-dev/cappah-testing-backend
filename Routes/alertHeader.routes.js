const express = require("express");
const alertHeaderRoute = express.Router();
const alertHeaderController = require("../Controllers/alertHeader.controller");

alertHeaderRoute.put("/update", alertHeaderController.alertHeaderUpdate);
alertHeaderRoute.get("/get", alertHeaderController.alertHeaderFind);

module.exports = alertHeaderRoute;
