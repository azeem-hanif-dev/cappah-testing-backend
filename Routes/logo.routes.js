const express = require("express");
const logoRouter = express.Router();
const logoController = require("../Controllers/logo.controller");
const { verifyJwt } = require("../Middlewares/verifyJwt.middleware");
const loggerMiddleware = require("../Middlewares/logger.middleware");

logoRouter.post(
  "/create",
  verifyJwt,
  loggerMiddleware,
  logoController.createLogo
);
logoRouter.get("/get-all", logoController.getAllLogos);
logoRouter.get("/get-by-id/:id", logoController.getLogoById);
logoRouter.patch(
  "/update/:id",
  verifyJwt,
  loggerMiddleware,
  logoController.updateLogo
);
logoRouter.delete(
  "/delete/:id",
  verifyJwt,
  loggerMiddleware,
  logoController.deleteLogo
);

module.exports = logoRouter;
