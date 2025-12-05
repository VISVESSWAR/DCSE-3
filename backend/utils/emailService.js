const nodemailer = require("nodemailer");

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  console.log("\n=== EMAIL CONFIGURATION CHECK ===");
  console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "not set");
  console.log("EMAIL_HOST:", process.env.EMAIL_HOST || "not set");
  console.log("EMAIL_USER:", process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : "not set");
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "***set***" : "not set");
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "not set");
  console.log("===============================\n");

  // If email credentials are provided, use them
  if (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  ) {
    console.log("Using custom SMTP configuration");
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // For Gmail, use OAuth2 or App Password
  if (process.env.EMAIL_SERVICE === "gmail" && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("Using Gmail service configuration");
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
    });
  }

  // Fallback: No email service configured
  console.log("No email service configured - will log reset link to console");
  return null;
};

const sendPasswordResetEmail = async (email, resetLink) => {
  console.log("\n=== SEND PASSWORD RESET EMAIL CALLED ===");
  console.log("Target Email:", email);
  console.log("Reset Link:", resetLink);
  console.log("========================================\n");
  
  try {
    let transporter = createTransporter();

    // If no transporter configured, log the link and return
    if (!transporter) {
      console.log("\n===========================================");
      console.log("PASSWORD RESET LINK (Development Mode)");
      console.log("===========================================");
      console.log(`Email: ${email}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log("===========================================\n");
      return {
        success: true,
        message: "Reset link generated (check console for link)",
        resetLink: process.env.NODE_ENV === "development" ? resetLink : null,
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@facultyportal.com",
      to: email,
      subject: "Password Reset Request - Faculty Portal",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #145DA0; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h1 style="margin: 0;">Password Reset Request</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px;">
            <p>Hello,</p>
            <p>You have requested to reset your password for the Faculty Portal account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #145DA0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #145DA0; background-color: #e8f4f8; padding: 10px; border-radius: 3px; font-size: 12px;">
              ${resetLink}
            </p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p style="background-color: #fff3cd; padding: 10px; border-radius: 3px; border-left: 3px solid #ffc107;">
              <strong>Mobile Users:</strong> If the link doesn't work on your mobile device:<br/>
              1. Make sure your mobile is on the same Wi-Fi network<br/>
              2. Copy the entire link above and paste it into your mobile browser<br/>
              3. Or manually enter the token (the part after "token=") on the reset password page<br/>
              4. If you see "null" in the link, contact support - the server needs to be configured with the correct frontend URL
            </p>
            <p>If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        You have requested to reset your password for the Faculty Portal account.
        
        Click the following link to reset your password:
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you did not request this password reset, please ignore this email.
      `,
    };

    // Verify connection before sending
    console.log("Verifying email transporter connection...");
    await transporter.verify();
    console.log("Email transporter verified successfully");

    const info = await transporter.sendMail(mailOptions);
    
    console.log("\n===========================================");
    console.log("PASSWORD RESET EMAIL SENT SUCCESSFULLY");
    console.log("===========================================");
    console.log("To:", email);
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("===========================================\n");
    
    return {
      success: true,
      message: "Password reset email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("\n===========================================");
    console.error("ERROR SENDING EMAIL");
    console.error("===========================================");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("Error Response:", error.response);
    console.error("Full Error:", error);
    console.error("===========================================\n");
    
    // Fallback: Log the link if email fails
    console.log("\n===========================================");
    console.log("EMAIL SEND FAILED - RESET LINK");
    console.log("===========================================");
    console.log(`Email: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("===========================================\n");
    
    return {
      success: false,
      message: `Failed to send email: ${error.message}. Reset link generated - check console.`,
      error: error.message,
      errorCode: error.code,
      resetLink: process.env.NODE_ENV === "development" ? resetLink : resetLink, // Always return in dev
    };
  }
};

module.exports = {
  sendPasswordResetEmail,
};

