
const nodemailer = require("nodemailer");



exports.sendOtp = async (email,otp) => {
    try {
      // Create the transporter using environment variables for secure credentials
      const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.USER,
          pass: process.env.PWD,
        },
      });
  
      
      const info = await transporter.sendMail({
        from: `<${process.env.SENDER}>`, // sender address
        to: `${email}`, // receiver address (user's email)
        subject: "Contact Form Submission", // Subject line
        text: "thanks for your submission  .",
        html: `here this is your OTP :${otp}`,
      });
  
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email. Please try again later.");
    }
  };