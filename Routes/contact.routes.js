const express = require("express");
const contactRouter = express.Router();
const contactController = require("../Controllers/contact.controller");

contactRouter.post("/create", contactController.createContact);

module.exports = contactRouter;
