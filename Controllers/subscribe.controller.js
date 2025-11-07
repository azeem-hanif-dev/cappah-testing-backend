const nodemailer = require("nodemailer");
const PotentialCustomer = require("../Models/potentialCustomer.model");

exports.sendConfirmationEmail = async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if email already exists
    const existingCustomer = await PotentialCustomer.findOne({ email });
    if (existingCustomer) {
      if (existingCustomer.visitCount > 0) {
        existingCustomer.visitCount = existingCustomer.visitCount + 1;
        await existingCustomer.save();
      } else {
        existingCustomer.visitCount = 1;
        await existingCustomer.save();
      }
    }

    if (!existingCustomer) {
      // Save email to database

      const potentialCustomer = new PotentialCustomer({
        email,
        source: "subscribe",
      });
      await potentialCustomer.save();
    }

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAILER_MAIL_ADDRESS,
        pass: process.env.NODE_MAILER_MAIL_PASS_KEY,
      },
    });

    const mailOptions = {
      from: process.env.NODE_MAILER_MAIL_ADDRESS,
      to: email,
      subject: "Thank You for Choosing RandB Global!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You for Choosing RandB Global</title>
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
                    <h2>Thank You for Choosing RandB Global!</h2>
                </div>
                <div class="content">
                    <p>Dear,</p>
                    <p>Thank You for Choosing RandB Global! We’re thrilled that you've taken the time to explore our products. Our team is dedicated to providing high-quality products to meet your needs, whether for corporate, domestic, or specialized requirements.</p>
                    <p>Should you have any questions or need assistance in selecting the right products, please don't hesitate to reach out. We’re here to ensure you receive the best solutions that align with your goals.</p>
                    <p>Thank you again for choosing RandB Global. We look forward to supporting you with our eco-friendly and reliable services!</p>
                </div>
                <div class="footer">
                    <p>Warm regards,</p>
                    <p><strong>RandB Global Team</strong></p>
                    <p>Email: <a href="mailto:sales@randbglobal.nl">sales@randbglobal.nl</a> | <a href="mailto:globalsales@randbglobal.nl">globalsales@randbglobal.nl</a></p>
                    <p class="contact-info">Customer Support Team<br>Contact: +92301 1143779</p>
                </div>
            </div>
        </body>
        </html>
    `,
    };

    // Send email with catalog
    await transporter.sendMail(mailOptions);

    // Success response
    res.status(200).json({ status: true, message: "Thank you for Subcribe!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

exports.getPotentailCustomers = async (req, res) => {
  try {
    const potentialCustomers = await PotentialCustomer.find().sort({
      createdAt: -1,
    });
    if (potentialCustomers) {
      res.status(200).json({ status: true, data: potentialCustomers });
    } else {
      res
        .status(404)
        .json({ status: false, message: "Potential Customers not found" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
