const express = require("express");
const router = express.Router();

const {
  doLogin,
  doForgotPassword,
  doResetPassword,
} = require("../controllers/controllerLogin");

// 1. Sign In
router.post("/loginUser", doLogin);
router.post("/login", doLogin);

// 2. Forgot Password (Step 1: Send OTP)
router.post("/forgot-password", doForgotPassword);

// 3. Reset Password (Step 2: Verify OTP & Hash Password with Argon2)
router.post("/reset-password", doResetPassword);

module.exports = router;