const Admin = require("../Models/admin.model");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use the appropriate email service
  auth: {
    user: process.env.NODE_MAILER_MAIL_ADDRESS,
    pass: process.env.NODE_MAILER_MAIL_PASS_KEY,
  },
});

exports.loginAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    let { username } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required" });
    }

    username = username.toLowerCase();

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res
        .status(404)
        .json({ status: false, message: "Invalid username or Password" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res
        .status(404)
        .json({ status: false, message: "Invalid username or Password" });
    }

    const CIP_Token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    //remove password from the admin data
    admin.password = undefined;
    res.status(200).json({
      status: true,
      CIP_Token,
      message: "Login Successfull",
      data: admin,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: false, message: "Internal server error", error });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    // Generate JWT for password reset
    const CIP_Token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    // Construct reset URL
    // Get front-end URL from the request headers
    const frontendURL = req.headers.origin;
    const resetURL = `${frontendURL}/reset-password/${CIP_Token}`;

    // const resetURL = `${req.protocol}://${req.get(
    //   "host"
    // )}/reset-password/${CIP_Token}`;

    // Send email with reset link
    const mailOptions = {
      to: admin.email,
      from: process.env.NODE_MAILER_MAIL_ADDRESS,
      subject: "Password Reset",
      html: `<p>You requested for a password reset</p>
             <p>Click this <a href="${resetURL}">link</a> to reset your password</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({
      status: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { CIP_Token } = req.params;
  const { password } = req.body;

  try {
    // Verify the CIP_Token
    const decoded = jwt.verify(CIP_Token, process.env.JWT_SECRET);

    // Find the admin using the decoded email
    const admin = await Admin.findOne({ email: decoded.email });
    if (!admin) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or expired CIP_Token" });
    }

    // Reset password
    const salt = await bcryptjs.genSalt(10);
    admin.password = await bcryptjs.hash(password, salt);

    await admin.save();

    res.status(200).json({ status: true, message: "Password has been reset" });
  } catch (error) {
    if (error.name === "CIP_TokenExpiredError") {
      return res
        .status(400)
        .json({ status: false, message: "CIP_Token has expired" });
    }
    console.log(error.message);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server error" });
  }
};
