const express = require("express");
const enquireRouter = express.Router();
const enquireController = require("../Controllers/enquire.controller");

enquireRouter.post("/create", enquireController.createEnquire);
enquireRouter.get("/", enquireController.getAllEnquires);
enquireRouter.put("/change-status/:id", enquireController.changeStatus);

module.exports = enquireRouter;
