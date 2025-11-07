const nodemailer = require("nodemailer");
const Enquire = require("../Models/enquire.model");
const PotentialCustomer = require("../Models/potentialCustomer.model");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_MAILER_MAIL_ADDRESS,
    pass: process.env.NODE_MAILER_MAIL_PASS_KEY,
  },
});

exports.createEnquire = async (req, res) => {
  try {
    const { fullname, phone, email, address, message, product } = req.body;

    // Validate phone number format
    if (!/^\d+$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain only digits.",
      });
    }

    // Create a new contact form entry
    const newEnquire = new Enquire({
      fullname,
      phone,
      email,
      address,
      product,
      message,
    });
    await newEnquire.save();

    // Email details
    const adminMailOptions = {
      from: process.env.NODE_MAILER_MAIL_ADDRESS, // Sender's email
      to: process.env.NODE_MAILER_MAIL_ADDRESS, // Recipient's email
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Full Name:</strong> ${fullname}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Address:</strong> ${address || "N/A"}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    const isPotentialCustomer = await PotentialCustomer.findOne({ email });
    if (isPotentialCustomer) {
      if (isPotentialCustomer.visitCount > 0) {
        isPotentialCustomer.visitCount = isPotentialCustomer.visitCount + 1;
        await isPotentialCustomer.save();
      } else {
        isPotentialCustomer.visitCount = 1;
        await isPotentialCustomer.save();
      }
    }

    if (!isPotentialCustomer) {
      const potentialCustomer = new PotentialCustomer({
        email,
        source: "enquire",
      });
      await potentialCustomer.save();
    }

    const userMailOptions = {
      from: process.env.NODE_MAILER_MAIL_ADDRESS,
      to: email,
      subject: "Thank You for Choosing Cappah International!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You for Choosing Cappah International</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333333;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    color: #4CAF50;
                }
                .content {
                    line-height: 1.6;
                    font-size: 16px;
                }
                .content p {
                    margin: 15px 0;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #666666;
                }
                .footer .contact-info {
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Thank You for Choosing Cappah International!</h2>
                </div>
                <div class="content">
                    <p>Dear,</p>
                    <p>Thank You for Choosing Cappah International! We're thrilled that you've taken the time to explore our products. Our team is dedicated to providing high-quality products to meet your needs, whether for corporate, domestic, or specialized requirements.</p>
                    <p>Should you have any questions or need assistance in selecting the right products, please don't hesitate to reach out. We're here to ensure you receive the best solutions that align with your goals.</p>
                    <p>Thank you again for choosing Cappah International. We look forward to supporting you with our eco-friendly and reliable services!</p>
                </div>
                <div class="footer">
                    <p>Warm regards,</p>
                    <p><strong>Cappah International Team</strong></p>
                    <p>Email: <a href="mailto:sales@randbglobal.nl">sales@randbglobal.nl</a> | <a href="mailto:globalsales@randbglobal.nl">globalsales@randbglobal.nl</a></p>
                    <p class="contact-info">Customer Support Team<br>Contact: +92301 1143779</p>
                </div>
            </div>
        </body>
        </html>
    `,
    };
    // Send the email
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(201).json({
      success: true,
      message: "Enquire Created successfully!",
      data: newEnquire,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Failed to submit enquire form",
      error: error.message,
    });
  }
};

exports.getAllEnquires = async (req, res) => {
  try {
    const enquiries = await Enquire.find()
      .sort({ createdAt: -1 })
      .populate("product", "title");

    res.status(200).json({
      success: true,
      data: enquiries,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve enquiries",
      error: error.message,
    });
  }
};

// Added changeStatus function
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get the enquiry ID from the request parameters
    const { status } = req.body; // Get the new status from the request body

    // Validate the status
    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value. Allowed values are 'pending' or 'completed'.",
      });
    }

    // Find the enquiry by ID and update its status
    const updatedEnquire = await Enquire.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedEnquire) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry status updated successfully.",
      data: updatedEnquire,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update enquiry status.",
      error: error.message,
    });
  }
};
