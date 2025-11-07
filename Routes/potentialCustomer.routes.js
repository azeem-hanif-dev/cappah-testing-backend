const express = require("express");
const potentialCustomerRoute = express.Router();
const potentialCustomerController = require("../Controllers/potentialCustomer.controller");
const { verifyJwt } = require("../Middlewares/verifyJwt.middleware");

potentialCustomerRoute.get(
  "/",
  verifyJwt,
  potentialCustomerController.potentialCustomer
);

module.exports = potentialCustomerRoute;
