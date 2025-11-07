const Permission = require("../Models/permission.model");

const checkPermission = (action, resource) => {
  return async (req, res, next) => {
    const adminRole = req.admin.role; // Assuming role is attached to the user in the request

    const permission = await Permission.findOne({ role: adminRole });
    if (
      !permission ||
      !permission.permissions[resource] ||
      !permission.permissions[resource][action]
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

module.exports = checkPermission;
