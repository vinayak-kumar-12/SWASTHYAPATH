const express = require("express");
const {
  registerController,
  loginController,
  refreshController,
  logoutController,
  getCurrentUserController,
  verifyEmailController,
  resendVerificationController,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
} = require("../controller/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

// Public auth endpoints
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshController);

// Email verification & password recovery public endpoints
router.post("/verify-email", verifyEmailController);
router.get("/verify-email", verifyEmailController);
router.post("/resend-verification", resendVerificationController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

// Authenticated endpoints
router.post("/logout", authenticate, logoutController);
router.get("/me", authenticate, getCurrentUserController);
router.post("/change-password", authenticate, changePasswordController);

module.exports = router;
