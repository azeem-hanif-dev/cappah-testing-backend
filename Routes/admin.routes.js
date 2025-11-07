const express = require("express");
const adminRouter = express.Router();
const loggerMiddleware = require("../Middlewares/logger.middleware");
const adminController = require("../Controllers/admin.controller");
const { verifyJwt } = require("../Middlewares/verifyJwt.middleware");
const { verifyRole } = require("../Middlewares/verifyRole.middleware");

adminRouter.post("/register", loggerMiddleware, adminController.registerAdmin);
adminRouter.get("/", verifyJwt, adminController.getAllAdmins);
adminRouter.get("/:id", verifyJwt, adminController.getAdminById);
adminRouter.patch(
  "/update/:id",
  verifyJwt,
  loggerMiddleware,
  adminController.updateAdmin
);
adminRouter.patch(
  "/update-role/:id",
  verifyJwt,
  loggerMiddleware,
  verifyRole("superAdmin"),
  adminController.updateAdminRole
);
adminRouter.delete(
  "/:id",
  verifyJwt,
  loggerMiddleware,
  verifyRole("superAdmin"),
  adminController.deleteAdmin
);
adminRouter.patch(
  "/change-password",
  verifyJwt,
  loggerMiddleware,
  adminController.changeAdminPassword
);

module.exports = adminRouter;
