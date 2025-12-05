const User = require("../models/User");
const Faculty = require("../models/Faculty");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailService");

const register = async (req, res) => {
  try {
    const { name, email, password, role, position, department, dob, dateOfJoining, phone, gender, qualifications, scaleOfPay, presentPay, natureOfAppointment } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password, role });
    await user.save();

    // Automatically create Faculty profile if role is faculty or hod
    if (role === "faculty" || role === "hod") {
      await Faculty.create({
        _id: user._id,
        facultyId: "FAC" + user._id.toString().slice(-3),
        name,
        position: position || (role === "hod" ? "Head of Department" : "Assistant Professor"),
        contactInfo: { email, phone: phone || "" },
        areasOfExpertise: qualifications ? qualifications.split(',').map(q => q.trim()) : [],
        classesHandled: [],
        dob: dob ? new Date(dob) : new Date("1990-01-01"),
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
        department: department || "",
        gender: gender || "",
        scaleOfPay: scaleOfPay || "",
        presentPay: presentPay || "",
        natureOfAppointment: natureOfAppointment || "Temporary",
        profilePicUrl: "",
        isActive: true
      });
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Please singup to the portal" });
  }
  const validate = await bcrypt.compare(password, user.password);
  console.log(user, validate);
  if (!validate) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // TEMP: Attach to req.user (in prod use session/JWT)
  req.user = user;
  console.log(req.user)

  res.status(200).json({
    message: "Login successful",
    user: {
      userId:user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const forgotPassword = async (req, res) => {
  try {
    console.log("\n===========================================");
    console.log("FORGOT PASSWORD REQUEST RECEIVED");
    console.log("===========================================");
    console.log("Request Body:", req.body);
    console.log("Time:", new Date().toISOString());
    console.log("===========================================\n");

    const { email } = req.body;
    
    if (!email) {
      console.log("ERROR: No email provided in request");
      return res.status(400).json({ message: "Email is required" });
    }

    console.log(`Looking up user with email: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User not found for email: ${email}`);
      // Don't reveal if email exists or not for security
      return res.status(200).json({ 
        message: "If that email exists, a password reset link has been sent." 
      });
    }

    console.log(`User found: ${user.name} (${user.email})`);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    console.log(`Generated reset token: ${resetToken.substring(0, 10)}...`);
    console.log(`Token expires at: ${new Date(resetTokenExpiry).toISOString()}`);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    console.log("Reset token saved to database");

    // Create reset link
    // Use environment variable or detect from request headers for mobile compatibility
    let frontendUrl = process.env.FRONTEND_URL;
    
    // Handle null/undefined FRONTEND_URL
    if (!frontendUrl || frontendUrl === 'null' || frontendUrl === 'undefined') {
      frontendUrl = null;
    }
    
    // If FRONTEND_URL is not set or is localhost, try to detect from request
    if (!frontendUrl || frontendUrl.includes('localhost')) {
      // Try to get from request origin (works when frontend makes the request)
      if (req.headers.origin) {
        try {
          const originUrl = new URL(req.headers.origin);
          frontendUrl = `${originUrl.protocol}//${originUrl.host}`;
          console.log(`Using frontend URL from request origin: ${frontendUrl}`);
        } catch (e) {
          console.log(`Could not parse origin: ${e.message}`);
        }
      }
      
      // If still not set, try to get from referer header
      if ((!frontendUrl || frontendUrl.includes('localhost')) && req.headers.referer) {
        try {
          const refererUrl = new URL(req.headers.referer);
          frontendUrl = `${refererUrl.protocol}//${refererUrl.host}`;
          console.log(`Using frontend URL from referer: ${frontendUrl}`);
        } catch (e) {
          console.log(`Could not parse referer: ${e.message}`);
        }
      }
      
      // Fallback to localhost if nothing works (for development)
      if (!frontendUrl || frontendUrl.includes('localhost')) {
        frontendUrl = 'http://localhost:5173';
        console.log(`Using default localhost URL: ${frontendUrl}`);
        console.log(`WARNING: For mobile access, set FRONTEND_URL=http://192.168.0.103:5173 in backend/.env`);
      }
    }
    
    // Final validation - ensure we have a valid URL
    if (!frontendUrl || frontendUrl === 'null' || frontendUrl === 'undefined' || !frontendUrl.startsWith('http')) {
      console.error("ERROR: Invalid frontend URL detected:", frontendUrl);
      console.error("Please set FRONTEND_URL in backend/.env file");
      console.error("For mobile access, use: FRONTEND_URL=http://192.168.0.103:5173");
      // Use a fallback that at least won't be null
      frontendUrl = 'http://192.168.0.103:5173'; // Your current IP
      console.log(`Using fallback IP: ${frontendUrl}`);
    }
    
    console.log(`Final frontend URL for reset link: ${frontendUrl}`);
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    console.log(`Reset link generated: ${resetLink.substring(0, 80)}...`);
    console.log(`Reset link created: ${resetLink}`);
    
    // Send email with reset link
    console.log("Attempting to send email...");
    const emailResult = await sendPasswordResetEmail(email, resetLink);
    console.log("Email result:", emailResult);
    
    // Return response based on email result
    if (emailResult.success) {
      res.status(200).json({ 
        message: "If that email exists, a password reset link has been sent.",
        // Include reset link in development mode if email service is not configured
        resetLink: emailResult.resetLink || undefined
      });
    } else {
      // Email failed but link is generated - return it for development
      res.status(200).json({ 
        message: emailResult.message || "Password reset link generated. Check console for the link.",
        resetLink: emailResult.resetLink || resetLink,
        warning: "Email sending failed. Check server console for details.",
        error: emailResult.error,
        errorCode: emailResult.errorCode
      });
    }
  } catch (err) {
    console.error("\n===========================================");
    console.error("FORGOT PASSWORD ERROR");
    console.error("===========================================");
    console.error("Error:", err);
    console.error("Error Stack:", err.stack);
    console.error("===========================================\n");
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    console.log("\n===========================================");
    console.log("RESET PASSWORD REQUEST RECEIVED");
    console.log("===========================================");
    console.log("Request Body:", { 
      token: req.body.token ? `${req.body.token.substring(0, 10)}...` : "MISSING",
      passwordLength: req.body.password ? req.body.password.length : 0
    });
    console.log("Time:", new Date().toISOString());
    console.log("===========================================\n");

    const { token, password } = req.body;

    if (!token || !password) {
      console.log("ERROR: Missing token or password");
      return res.status(400).json({ message: "Token and password are required" });
    }

    if (password.length < 6) {
      console.log("ERROR: Password too short");
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    console.log(`Looking up user with reset token: ${token.substring(0, 10)}...`);
    console.log(`Current time: ${Date.now()}`);
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log("ERROR: User not found or token expired");
      // Check if token exists but expired
      const expiredUser = await User.findOne({ resetPasswordToken: token });
      if (expiredUser) {
        console.log(`Token found but expired. Expiry: ${new Date(expiredUser.resetPasswordExpires).toISOString()}`);
        return res.status(400).json({ message: "Reset token has expired. Please request a new password reset link." });
      }
      return res.status(400).json({ message: "Invalid reset token. Please request a new password reset link." });
    }

    console.log(`User found: ${user.name} (${user.email})`);
    console.log(`Token expires at: ${new Date(user.resetPasswordExpires).toISOString()}`);

    // Set plain password - the User model's pre-save hook will hash it automatically
    console.log("Setting new password (will be hashed by pre-save hook)...");
    user.password = password; // Set plain password - pre-save hook will hash it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.log("Password updated successfully");
    
    // Verify the password was hashed correctly
    const verifyUser = await User.findById(user._id);
    const testCompare = await bcrypt.compare(password, verifyUser.password);
    console.log(`Password verification test: ${testCompare ? "PASSED" : "FAILED"}`);

    console.log("\n===========================================");
    console.log("PASSWORD RESET SUCCESSFUL");
    console.log("===========================================\n");

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("\n===========================================");
    console.error("RESET PASSWORD ERROR");
    console.error("===========================================");
    console.error("Error:", err);
    console.error("Error Stack:", err.stack);
    console.error("===========================================\n");
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const testEmail = async (req, res) => {
  try {
    const { sendTo } = req.body;
    const testEmail = sendTo || process.env.EMAIL_USER;
    
    if (!testEmail) {
      return res.status(400).json({ message: "No email address provided" });
    }

    const { sendPasswordResetEmail } = require("../utils/emailService");
    const testLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=test-token-123`;
    
    const result = await sendPasswordResetEmail(testEmail, testLink);
    
    res.status(200).json({
      message: "Email test completed",
      result: result,
      emailConfig: {
        hasEmailService: !!process.env.EMAIL_SERVICE,
        hasEmailHost: !!process.env.EMAIL_HOST,
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS,
      }
    });
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, testEmail };
