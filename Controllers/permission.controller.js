const Permission = require("../Models/permission.model"); // Import the Permission model

// Create a new permission for a role
exports.createPermission = async (req, res) => {
  try {
    const { role, permissions } = req.body;
    const isSuperAdmin = role === "Super Admin";
    if (isSuperAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "You can't create Super Admin role" });
    }
    // const existingRole = await Admin.findOne({
    //   role: { $regex: /^super\s*admin$/i },
    // });
    const newPermission = new Permission({ role, permissions });
    await newPermission.save();
    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      newPermission,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server error", error });
  }
};

// Get All permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permission = await Permission.find();
    if (!permission)
      return res.status(404).json({
        success: false,
        message: "Permissions not found",
      });
    res.status(200).json({ success: true, permission });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server error", error });
  }
};

// Get permissions for a specific role
exports.getPermissionsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const permission = await Permission.findOne({ role });
    if (!permission)
      return res.status(404).json({
        success: false,
        message: "Permissions not found for this role",
      });
    res.status(200).json({ success: true, permission });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server error", error });
  }
};

exports.getPermissionsById = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findById(id);
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permissions not found for this ID",
      });
    }
    res.status(200).json({ success: true, permission });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server error", error });
  }
};

exports.getPermissionsByAdminId = async (req, res) => {
  try {
    const role = req.admin.role;

    const permission = await Permission.findOne({ role });
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permissions not found for this User",
      });
    }
    res.status(200).json({ success: true, permission });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server error", error });
  }
};

// Update permissions for a specific role
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;
    const existingPermission = await Permission.findById(id);
    if (existingPermission.role === "superAdmin") {
      return res.status(400).json({
        success: false,
        message: "Can't Update superAdmin Role Permissions",
      });
    }
    if (existingPermission.role === "Member") {
      return res.status(400).json({
        success: false,
        message: "Can't Update Member Role Permissions",
      });
    }

    const updatedData = { role, permissions };

    const permission = await Permission.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permissions not found for this ID",
      });
    }

    res.status(200).json({
      success: true,
      message: "Permissions updated successfully",
      permission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating permissions",
      error: error.message,
    });
  }
};

// Delete permissions for a specific role
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const existingPermission = await Permission.findById(id);
    if (existingPermission.role === "superAdmin") {
      return res.status(400).json({
        success: false,
        message: "Can't Delete superAdmin Role Permissions",
      });
    }
    if (existingPermission.role === "Member") {
      return res.status(400).json({
        success: false,
        message: "Can't Delete Member Role Permissions",
      });
    }

    const permission = await Permission.findByIdAndDelete(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permissions not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Permissions deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server error", error });
  }
};
