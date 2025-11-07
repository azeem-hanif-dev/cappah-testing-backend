const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: [3, 'Name must be at least 3 characters long'],
      maxlength: [100, 'Name cannot be longer than 100 characters']
    },
    email: {
      type: String,
      required: true,
      lowercase: true, // Store email in lowercase
      validate: {
        validator: function (v) {
          return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid email format!`
      },
    },
    phoneNumber: {
      type: String,
      required: false,
      match: /^(?:\+(\d{1,3}))?0?[1-9][0-9]{9}$/, // Updated phone number validation regex
      validate: {
        validator: function(v) {
          // Ensure phone number is entered with country code
          return /^\+?\d{1,3}[1-9][0-9]{9,14}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number with country code!`
      }
    },
    password: {
      type: String, // Ensure it's a string
      required: [true, "Password is required"], // Make it mandatory
      minlength: [8, "Password must be at least 8 characters long"], // Minimum length for validation
      maxlength: [100, "Password hash must not exceed 100 characters"], // Adjusted for the hash length
      validate: {
        validator: function (value) {
          // Only validate non-hashed passwords before hashing
          if (!this.isModified('password')) return true; // Skip validation for already hashed passwords
          return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,17}$/.test(value);
        },
        message:
          "Password must be 8-17 characters long and include at least one uppercase letter, one digit, and one special character (!@#$%^&*).",
      },
    },
    otp:{
      type:String
    },
    address: {
      type: String,
      maxlength: [70, 'Address cannot be longer than 70 characters'],
    },
  otpExpiresAt:{ 
      type: Date },
      
  dob: {
      type: Date,
      required: true,
      validate: {
        validator: function(v) {
          return v <= new Date(); // Ensure DOB is not in the future
        },
        message: 'Date of birth cannot be in the future'
      },
    },
  },
  { timestamps: true }
);

// Pre-save middleware to automatically convert email to lowercase
UserSchema.pre("save", function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  
  
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
UserSchema.pre('save', function (next) {
  if (this.isModified('otp')) {
    
    this.otpUpdatedAt = new Date(); // Track the last update time
  }
  next();
});
const User = mongoose.model("User", UserSchema);

module.exports = User;
