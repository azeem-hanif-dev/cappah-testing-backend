const express = require("express");
const eventRouter = express.Router();
const eventController = require("../Controllers/event.controller");
const { verifyJwt } = require("../Middlewares/verifyJwt.middleware");
const { verifyRole } = require("../Middlewares/verifyRole.middleware");
const loggerMiddleware = require("../Middlewares/logger.middleware");
const checkPermission = require("../Middlewares/permission.middleware");
// Route to create an event
eventRouter.post(
  "/create",
  verifyJwt,
  checkPermission("create", "event"),
  loggerMiddleware,
  eventController.createEvent
);

// Route to get the event
eventRouter.get("/get-all", eventController.getAllEvents);
eventRouter.get("/get-by-id/:id", eventController.getEventById);
eventRouter.get("/get-by-status/:status", eventController.getEventsByStatus);

// Route to update the event
eventRouter.put(
  "/update/:id",
  verifyJwt,
  loggerMiddleware,
  checkPermission("update", "event"),
  eventController.updateEvent
);

// Route to change event status
eventRouter.patch(
  "/status-change/:id",
  verifyJwt,
  loggerMiddleware,
  checkPermission("statusChange", "event"),
  eventController.statusChangeOfEvent
);

// Route to delete the event
eventRouter.delete(
  "/:id",
  verifyJwt,
  loggerMiddleware,
  verifyRole("superAdmin"),
  eventController.deleteEvent
);

module.exports = eventRouter;
