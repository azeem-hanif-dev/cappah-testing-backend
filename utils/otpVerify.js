const otpGenerator = require('otp-generator');
const User=require('../Models/user.model') // Adjust the path to your User model

// Utility function to generate OTP
exports.generateOTP = async (email) => {
    try {
      if (!email) throw new Error('Email is required');
  
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
  
      const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: true,
        specialChars: true,
      });
  
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds
  
      // Save OTP and expiry time to the user's record
      user.otp = otp;
      user.otpExpiresAt = expiresAt;
      await user.save();
  
      return user; // Return the OTP to be used elsewhere (e.g., sent via email/SMS)
    } catch (error) {
      throw new Error(error.message); // Rethrow the error for external handling
    }
  };

// Utility function to verify OTP
exports.verifyOTP = async ( find,otpUser) => {
    try {
        if ( !otpUser) throw new Error(' OTP are required');

//   const findUser = await User.findOne({ email });
//   if (!findUser) throw new Error('User not found');
  if (find.otp !== otpUser) throw new Error('Invalid OTP');
  if (Date.now() > find.otpExpiresAt) throw new Error('OTP has expired');

  find.otp = undefined;
  find.otpExpiresAt = undefined;
 // await find.save();

  return true; 
    } catch (error) {
        throw new Error(error.message); 
    }
  
};


