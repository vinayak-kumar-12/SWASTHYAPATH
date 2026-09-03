const authService = require("../service/auth.service");
const {
  validateInput,
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("../utils/validators");
const { ValidationError } = require("../utils/errors");

/**
 * POST /api/v1/auth/register
 */
const registerController = async (req, res, next) => {
  try {
    const validation = validateInput(registerSchema, req.body);
    if (!validation.success) {
      throw new ValidationError("Invalid request data", validation.details);
    }

    const result = await authService.registerUser(validation.data);

    res.status(201).json({
      success: true,
      data: result,
      message: "Registration successful",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/login
 */
const loginController = async (req, res, next) => {
  try {
    const validation = validateInput(loginSchema, req.body);
    if (!validation.success) {
      throw new ValidationError("Invalid request data", validation.details);
    }

    const result = await authService.loginUser(validation.data);

    res.status(200).json({
      success: true,
      data: result,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh
 */
const refreshController = async (req, res, next) => {
  try {
    const validation = validateInput(refreshSchema, req.body);
    if (!validation.success) {
      throw new ValidationError("Invalid request data", validation.details);
    }

    const result = await authService.refreshAccessToken(validation.data.refreshToken);

    res.status(200).json({
      success: true,
      data: result,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 */
const logoutController = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const result = await authService.logoutUser(userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 */
const getCurrentUserController = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST or GET /api/v1/auth/verify-email
 */
const verifyEmailController = async (req, res, next) => {
  try {
    const rawToken = req.body?.token || req.query?.token;
    if (!rawToken) {
      throw new ValidationError("Verification token is required", [
        { field: "token", message: "Token field is required" },
      ]);
    }

    const result = await authService.verifyEmail(rawToken);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/resend-verification
 */
const resendVerificationController = async (req, res, next) => {
  try {
    const validation = validateInput(resendVerificationSchema, req.body);
    if (!validation.success) {
      throw new ValidationError("Invalid request data", validation.details);
    }

    const result = await authService.resendVerificationEmail(validation.data.email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/forgot-password
 */
const forgotPasswordController = async (req, res, next) => {
  try {
    const validation = validateInput(forgotPasswordSchema, req.body);
    if (!validation.success) {
      throw new ValidationError("Invalid request data", validation.details);
    }

    const result = await authService.forgotPassword(validation.data.email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/reset-password
 */
const resetPasswordController = async (req, res, next) => {
  try {
    const validation = validateInput(resetPasswordSchema, req.body);
    if (!validation.success) {
      throw new ValidationError("Invalid request data", validation.details);
    }

    const result = await authService.resetPassword(validation.data);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/change-password
 */
const changePasswordController = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const validation = validateInput(changePasswordSchema, req.body);
    if (!validation.success) {
      throw new ValidationError("Invalid request data", validation.details);
    }

    const result = await authService.changePassword(userId, validation.data);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};