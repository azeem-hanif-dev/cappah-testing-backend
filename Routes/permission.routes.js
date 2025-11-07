const express = require("express");
const permissionRouter = express.Router();
const permissionController = require("../Controllers/permission.controller");
const loggerMiddleware = require("../Middlewares/logger.middleware");
const { verifyRole } = require("../Middlewares/verifyRole.middleware");
const { verifyJwt } = require("../Middlewares/verifyJwt.middleware");

permissionRouter.post(
  "/create",
  verifyJwt,
  loggerMiddleware,
  verifyRole("superAdmin"),
  permissionController.createPermission
);

permissionRouter.get(
  "/",
  verifyJwt,
  verifyRole("superAdmin"),
  permissionController.getAllPermissions
);
permissionRouter.get(
  "/role/:role",
  verifyJwt,
  verifyRole("superAdmin"),
  permissionController.getPermissionsByRole
);

permissionRouter.get(
  "/id/:id",
  verifyJwt,
  verifyRole("superAdmin"),
  permissionController.getPermissionsById
);
permissionRouter.get(
  "/by-admin",
  verifyJwt,
  permissionController.getPermissionsByAdminId
);

permissionRouter.patch(
  "/:id",
  verifyJwt,
  loggerMiddleware,
  verifyRole("superAdmin"),
  permissionController.updatePermission
);

permissionRouter.delete(
  "/:id",
  verifyJwt,
  loggerMiddleware,
  verifyRole("superAdmin"),
  permissionController.deletePermission
);

module.exports = permissionRouter;
