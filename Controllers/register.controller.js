require("dotenv").config();

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../Models/user.model");
const { verifyOTP, generateOTP } = require("../utils/otpVerify");
const { sendOtp } = require("../utils/Mail");

exports.UserForm = async (req, res) => {
  try {
    await body("email")
      .isEmail()
      .withMessage("please enter a valid email")
      .run(req);

    await body("name")
      .notEmpty()
      .withMessage("username must be enter")
      .run(req);

    await body("phonenumber")
      .optional() // Since `required: false` in the schema
      .notEmpty()
      .withMessage("Phone number must be entered.")
      .matches(/^\+?\d{1,3}[1-9][0-9]{9,14}$/) // Updated regex for country code
      .withMessage("Phone number must be valid and include a country code.")
      .run(req);

    await body("password")
      .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,17}$/)
      .withMessage(
        "Password b/w 8-17 characters,least one uppercase letter & digit & special character"
      )
      .run(req);

    await body("dob")
      .isDate()
      .withMessage("Date of Birth must be a valid date")
      .run(req);

    await body("address")
      .notEmpty()
      .withMessage("address must be enter")
      .run(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { email, name, password, phoneNo, address, dob } = req.body;

    const userCreate = await User.create({
      email,
      name,
      password,
      phoneNumber: phoneNo,
      address,
      dob,
    });
    const CIP_Token = jwt.sign({ email }, process.env.SECRET, {
      expiresIn: "2d",
    });

    return res
      .cookie("CIP_Token", CIP_Token, {
        https: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        data: userCreate,
        CIP_Token,
      });
  } catch (error) {
    if (error.code === 11000) {
      // Extract the field causing the duplicate error
      const field = Object.keys(error.keyValue)[0]; // e.g., 'name'
      const value = error.keyValue[field]; // e.g., 'aai aavirk'

      return res.status(400).json({
        success: false,
        message: `Duplicate value error: ${field} "${value}" already exists.`,
      });
    }

    // General error handler
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.loginForm = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "useremail And password  is required" });
    }
    const findUser = await User.findOne({ email });

    if (!findUser || !(await bcrypt.compare(password, findUser.password))) {
      return res
        .status(500)
        .json({ success: false, message: "please enter right credential " });
    }
    /////////////
    const CIP_Token = jwt.sign({ email }, process.env.SECRET, {
      expiresIn: "2d",
    });

    return res
      .cookie("CIP_Token", CIP_Token, {
        https: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "user have login ",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.changePwd = async (req, res) => {
  try {
    const { newPassword, confirmPassword, oldPassword } = req.body;
    let email = req.user;

    const FindUser = await User.findOne({ email: email.email });

    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword ||
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        message: !oldPassword
          ? "Old password is required"
          : newPassword !== confirmPassword
          ? "Passwords do not match"
          : "Both newPassword and confirmPassword are required",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, FindUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    FindUser.password = newPassword;

    await FindUser.save();

    return res
      .cookie("CIP_Token", CIP_Token, {
        https: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "you have change password done ",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.error });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "useremail   is required" });
    }

    const OTP = await generateOTP(email);

    let OtpSend = OTP.otp;
    try {
      await sendOtp(email, OtpSend); // Send confirmation email
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send confirmation email.",
      });
    }

    const CIP_Token = jwt.sign({ email }, process.env.SECRET, {
      expiresIn: "2d",
    });

    return res
      .cookie("CIP_Token", CIP_Token, {
        https: true,
        maxAge: 2 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        message: "otp send on your email please password and otp ",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.ForgetPwdOtpVerify = async (req, res) => {
  try {
    let find = req.user;
    const { otpUser, password } = req.body;
    if (!find) {
      return res
        .status(400)
        .json({ success: false, message: " user email is missing " });
    }

    let abc = await verifyOTP(find, otpUser);
    find.password = password;

    const upDate = await find.save();
    return res.status(200).json({
      success: true,
      date: upDate,
      message: "User password successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.ReSendOtp = async (req, res) => {
  try {
    let userAuthentication = req.user;
    let email = userAuthentication.email;

    const OTP = await generateOTP(email);

    let OtpSend = OTP.otp;
    try {
      await sendOtp(email, OtpSend); // Send confirmation email
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send confirmation email.",
      });
    }
    await OTP.save();
    return res.status(200).json({
      success: true,
      date: OTP,
      message: "Send OtP on  successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
