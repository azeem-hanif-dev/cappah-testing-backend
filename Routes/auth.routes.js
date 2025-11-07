const express = require("express");
const authRouter = express.Router();
const authController = require("../Controllers/auth.controller");
const loggerMiddleware = require("../Middlewares/logger.middleware");

authRouter.post("/login", loggerMiddleware, authController.loginAdmin);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password/:token", authController.resetPassword);

module.exports = authRouter;
