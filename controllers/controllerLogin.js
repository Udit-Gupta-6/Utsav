const nodemailer = require("nodemailer");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const UsersColRef = require("../models/modelUsers");

// ============================================================================
// 1. IN-MEMORY OTP STORE (email -> { otp, expiresAt })
// ============================================================================
const otpStore = new Map();

// ============================================================================
// 2. NODEMAILER TRANSPORTER SETUP
// ============================================================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g., yourname@gmail.com
    pass: process.env.EMAIL_PASS, // 16-character Google App Password
  },
});

// Verify transporter on startup to catch auth errors immediately
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Transporter Error:", error);
  } else {
    console.log("✅ Mail server is ready to send messages!");
  }
});

// ============================================================================
// 3. CONTROLLER: LOGIN (With Blocked Account Check)
// ============================================================================
async function doLogin(req, resp) {
  try {
    const { emailid, password } = req.body;

    if (!emailid || !password) {
      return resp.json({ status: false, msg: "All fields are required" });
    }

    const cleanEmail = emailid.trim().toLowerCase();
    const findUser = await UsersColRef.findOne({ emailid: cleanEmail });

    // 1. Check if user exists
    if (!findUser) {
      return resp.json({ status: false, msg: "Invalid Email ID or Password" });
    }

    // 2. ⭐ BLOCK CHECK: If status is false (or 0), reject login!
    if (findUser.status === false || findUser.status === 0) {
      return resp.json({
        status: false,
        msg: "Your account has been blocked by the Administrator. You cannot login!",
      });
    }

    // 3. Verify password with argon2
    const verifyPass = await argon2.verify(findUser.password, password);
    if (!verifyPass) {
      return resp.json({ status: false, msg: "Invalid Email ID or Password" });
    }

    // 4. Generate JWT token
    const jtoken = jwt.sign(
      { emailid: cleanEmail, utype: findUser.utype },
      process.env.SEC_KEY || "utsav_secret_key",
      { expiresIn: "2h" }
    );

    return resp.json({
      status: true,
      msg: "Login Successful",
      utype: findUser.utype,
      emailid: cleanEmail,
      token: jtoken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return resp.status(500).json({
      status: false,
      msg: "Server error during login",
    });
  }
}

// ============================================================================
// 4. CONTROLLER: SEND OTP (Forgot Password Step 1)
// ============================================================================
async function doForgotPassword(req, resp) {
  try {
    const { emailid } = req.body;

    if (!emailid || !emailid.trim()) {
      return resp.json({ status: false, msg: "Email ID is required" });
    }

    const cleanEmail = emailid.trim().toLowerCase();

    // 1. Verify user exists in Database
    const findUser = await UsersColRef.findOne({ emailid: cleanEmail });
    if (!findUser) {
      return resp.json({
        status: false,
        msg: "No registered account found with this email ID",
      });
    }

    // 2. ⭐ Blocked users cannot request password resets
    if (findUser.status === false || findUser.status === 0) {
      return resp.json({
        status: false,
        msg: "Your account is blocked by the Administrator. Password reset is not permitted.",
      });
    }

    // 3. Generate 6-digit OTP & 10-minute validity
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // 4. Store OTP in memory
    otpStore.set(cleanEmail, { otp, expiresAt });

    console.log(`🔑 [DEV DEBUG] OTP for ${cleanEmail}: ${otp}`);

    // 5. UTSAV Branded Email Template
    const mailOptions = {
      from: `"UTSAV Celebrations" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "UTSAV - Your Password Reset Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #fffaf5; padding: 30px; border-radius: 16px; max-width: 500px; margin: auto; border: 1px solid #fed7aa; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ea580c; margin: 0; font-size: 26px; letter-spacing: 2px;">UTSAV</h2>
            <p style="color: #c2410c; margin: 4px 0 0; font-size: 11px; text-transform: uppercase; font-weight: bold;">Celebrate Every Moment</p>
          </div>

          <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #ffedd5;">
            <h3 style="margin-top: 0; color: #1f2937; font-size: 18px;">Password Reset Request</h3>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              We received a request to reset your UTSAV password. Use the verification code below:
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ea580c; background-color: #fff7ed; padding: 12px 24px; border-radius: 10px; border: 2px dashed #fb923c;">
                ${otp}
              </span>
            </div>

            <p style="color: #6b7280; font-size: 13px; text-align: center; margin: 0;">
              ⏳ This code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `,
    };

    // 6. Send via Nodemailer
    await transporter.sendMail(mailOptions);

    return resp.json({
      status: true,
      msg: "OTP sent successfully to your email address!",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return resp.status(500).json({
      status: false,
      msg: "Failed to send OTP email. Please check your email configuration.",
      error: error.message,
    });
  }
}

// ============================================================================
// 5. CONTROLLER: RESET PASSWORD (Step 2 - Verify OTP + Argon2)
// ============================================================================
async function doResetPassword(req, resp) {
  try {
    const { emailid, otp, newPassword } = req.body;

    if (!emailid || !otp || !newPassword) {
      return resp.json({ status: false, msg: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return resp.json({
        status: false,
        msg: "Password must be at least 6 characters long",
      });
    }

    const cleanEmail = emailid.trim().toLowerCase();
    const storedRecord = otpStore.get(cleanEmail);

    if (!storedRecord) {
      return resp.json({
        status: false,
        msg: "OTP expired or session not found. Please request a new OTP.",
      });
    }

    if (Date.now() > storedRecord.expiresAt) {
      otpStore.delete(cleanEmail);
      return resp.json({
        status: false,
        msg: "OTP has expired. Please request a new OTP.",
      });
    }

    if (storedRecord.otp !== otp.toString().trim()) {
      return resp.json({
        status: false,
        msg: "Invalid OTP code. Please enter the correct 6-digit OTP.",
      });
    }

    // Hash new password using Argon2
    const hashedPassword = await argon2.hash(newPassword);

    // Update password in MongoDB
    const updateResult = await UsersColRef.updateOne(
      { emailid: cleanEmail },
      { $set: { password: hashedPassword } }
    );

    if (updateResult.matchedCount === 0) {
      return resp.json({
        status: false,
        msg: "User account not found",
      });
    }

    // Delete OTP once used
    otpStore.delete(cleanEmail);

    return resp.json({
      status: true,
      msg: "Password reset successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return resp.status(500).json({
      status: false,
      msg: "Server error during password reset",
    });
  }
}

module.exports = {
  doLogin,
  doForgotPassword,
  doResetPassword,
};