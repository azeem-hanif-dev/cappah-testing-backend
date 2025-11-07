const Admin = require("../Models/admin.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Create Admins
exports.registerAdmin = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      contactNumber,
      gender,
      address,
      dateOfBirth,
    } = req.body;

    if (!fullName) {
      return res
        .status(400)
        .json({ status: false, message: "fullName is Required" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is Required" });
    }
    if (!username) {
      return res
        .status(400)
        .json({ status: false, message: "username is Required" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Password is Required " });
    }

    if (!contactNumber) {
      return res
        .status(400)
        .json({ status: false, message: "Contact Number is Required " });
    }

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const minDate = new Date("1900-01-01");

      // Check if the date of birth is in the past
      if (dob >= Date.now()) {
        return res.status(400).json({
          status: false,
          message: "Date of birth must be in the past.",
        });
      }

      // Check if the date of birth is before the minimum date
      if (dob < minDate) {
        return res.status(400).json({
          status: false,
          message: "Date of birth must be after January 1, 1900.",
        });
      }
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({
        status: false,
        message: "Admin Already register please loging",
      });
    }

    //Password Hashing
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const admin = new Admin({
      fullName,
      email,
      username: username.toLowerCase(),
      password: hashedPassword,
      contactNumber,
      gender,
      address,
      dateOfBirth,
    });

    // Generate JWT CIP_Token
    const CIP_Token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );
    if (CIP_Token) admin.save();

    // remove password from admin data
    // if (CIP_Token) admin.password = undefined;

    res.status(201).json({ status: true, CIP_Token, data: admin });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get all Admins sorted by the most recently added
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 }); // Sort by createdAt in descending order
    res.status(200).json({ status: true, data: admins });
  } catch (err) {
    res.status(500).json({ status: false, message: "Failed to fetch admins" });
  }
};

// Get Admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (err) {
    res
      .status(500)
      .json({ status: false, message: "Failed to fetch the admin" });
  }
};

// Update Admin by ID
exports.updateAdmin = async (req, res) => {
  try {
    const { email, address, contactNumber } = req.body;
    const updatedData = {};
    if (email) updatedData.email = email;
    if (address) updatedData.address = address;
    if (contactNumber) updatedData.contactNumber = contactNumber;

    const admin = await Admin.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }
    res.status(200).json({
      status: true,
      message: "Admin updated successfully",
      data: admin,
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: "Internal Server error",
    });
  }
};
// Update Admin Role by ID
exports.updateAdminRole = async (req, res) => {
  try {
    const { role } = req.body;
    const updatedData = {};
    if (role === "superAdmin") {
      return res
        .status(400)
        .json({ success: false, message: "superAdmin role is not allowed" });
    }
    if (role) updatedData.role = role;

    const admin = await Admin.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }
    res.status(200).json({
      status: true,
      message: "Admin updated successfully",
      data: admin,
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: "Internal Server error",
    });
  }
};

// Delete Admin by ID
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: "Failed to delete admin" });
  }
};

//Change Password
exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin._id;

    // Find the user by ID
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Admin not found" });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Incorrect current password" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;

    // Save the updated user
    await admin.save();

    return res
      .status(200)
      .json({ status: true, message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server error" });
  }
};
