const bcrypt = require("bcrypt");
const { pool } = require("../config/database");
const userModel = require("../models/user.model");
const authTokenModel = require("../models/authToken.model");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { generateSecureToken, hashToken } = require("../utils/cryptoToken");
const {
  NOTIFICATION_EVENTS,
  emitNotificationEvent,
} = require("../utils/notificationEvents");
const {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/errors");
const logger = require("../utils/logger");

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_EXPIRES_HOURS = 24;
const RESET_TOKEN_EXPIRES_HOURS = 1;

const sanitizeUser = (user) => {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
  };
};

/**
 * Register a new user
 */
const registerUser = async ({ name, email, phone, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await userModel.findUserByEmail(normalizedEmail);
  if (existingUser) {
    logger.warn("Registration attempt failed: User already exists");
    throw new UserAlreadyExistsError("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Generate email verification token
  const rawVerificationToken = generateSecureToken();
  const tokenHash = hashToken(rawVerificationToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

  const client = await pool.connect();
  let newUser;
  try {
    await client.query("BEGIN");

    newUser = await userModel.createUser(
      {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash,
        role,
      },
      client
    );

    await authTokenModel.createToken(
      {
        userId: newUser.userId,
        tokenHash,
        tokenType: "EMAIL_VERIFICATION",
        expiresAt,
      },
      client
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const safeUser = sanitizeUser(newUser);

  // Emit notification events for decoupled Notification Service
  emitNotificationEvent(NOTIFICATION_EVENTS.USER_EMAIL_VERIFICATION_REQUESTED, {
    userId: safeUser.userId,
    email: safeUser.email,
    name: safeUser.name,
    token: rawVerificationToken,
    expiresAt,
  });

  emitNotificationEvent(NOTIFICATION_EVENTS.USER_WELCOME, {
    userId: safeUser.userId,
    email: safeUser.email,
    name: safeUser.name,
  });

  const accessToken = generateAccessToken(safeUser);
  const refreshToken = generateRefreshToken(safeUser);

  logger.info({ userId: safeUser.userId, role: safeUser.role }, "User registered successfully");

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

/**
 * Authenticate user with credentials
 */
const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await userModel.findUserByEmail(normalizedEmail);
  if (!user) {
    logger.warn("Login failed: User not found");
    throw new InvalidCredentialsError("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    logger.warn({ userId: user.userId }, "Login failed: Password mismatch");
    throw new InvalidCredentialsError("Invalid email or password");
  }

  const safeUser = sanitizeUser(user);

  const accessToken = generateAccessToken(safeUser);
  const refreshToken = generateRefreshToken(safeUser);

  logger.info({ userId: safeUser.userId }, "User logged in successfully");

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh Access Token using Refresh Token
 */
const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  const user = await userModel.findUserById(decoded.sub);
  if (!user) {
    throw new UnauthorizedError("User no longer exists", "USER_NOT_FOUND");
  }

  const safeUser = sanitizeUser(user);
  const newAccessToken = generateAccessToken(safeUser);
  const newRefreshToken = generateRefreshToken(safeUser);

  logger.info({ userId: safeUser.userId }, "Access token refreshed successfully");

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

/**
 * Get current authenticated user
 */
const getCurrentUser = async (userId) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new NotFoundError("User account not found", "USER_NOT_FOUND");
  }

  return sanitizeUser(user);
};

/**
 * Logout user
 */
const logoutUser = async (userId) => {
  logger.info({ userId }, "User logged out");
  return {
    message: "Logout successful. Client should discard stored tokens.",
  };
};

/**
 * Verify user email via token
 */
const verifyEmail = async (rawToken) => {
  const tokenHash = hashToken(rawToken);

  const tokenRecord = await authTokenModel.findTokenByHash(tokenHash, "EMAIL_VERIFICATION");
  if (!tokenRecord || tokenRecord.usedAt || new Date(tokenRecord.expiresAt) < new Date()) {
    throw new UnauthorizedError("Invalid or expired verification token", "INVALID_TOKEN");
  }

  const client = await pool.connect();
  let updatedUser;
  try {
    await client.query("BEGIN");

    updatedUser = await userModel.markUserEmailVerified(tokenRecord.userId, client);
    await authTokenModel.markTokenUsed(tokenRecord.tokenId, client);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  emitNotificationEvent(NOTIFICATION_EVENTS.USER_EMAIL_VERIFIED, {
    userId: updatedUser.userId,
    email: updatedUser.email,
  });

  logger.info({ userId: updatedUser.userId }, "User email verified successfully");

  return {
    message: "Email verified successfully",
  };
};

/**
 * Resend email verification link
 */
const resendVerificationEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const genericResponse = {
    message: "If an unverified account exists with this email, a verification link has been sent.",
  };

  const user = await userModel.findUserByEmail(normalizedEmail);
  if (!user || user.isVerified) {
    return genericResponse;
  }

  const rawVerificationToken = generateSecureToken();
  const tokenHash = hashToken(rawVerificationToken);
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await authTokenModel.invalidateTokens(user.userId, "EMAIL_VERIFICATION", client);
    await authTokenModel.createToken(
      {
        userId: user.userId,
        tokenHash,
        tokenType: "EMAIL_VERIFICATION",
        expiresAt,
      },
      client
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  emitNotificationEvent(NOTIFICATION_EVENTS.USER_EMAIL_VERIFICATION_REQUESTED, {
    userId: user.userId,
    email: user.email,
    name: user.name,
    token: rawVerificationToken,
    expiresAt,
  });

  logger.info({ userId: user.userId }, "Verification email resent successfully");

  return genericResponse;
};

/**
 * Initiate forgot password flow (generates reset token)
 */
const forgotPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const genericResponse = {
    message: "If an account exists, a password reset link has been sent.",
  };

  const user = await userModel.findUserByEmail(normalizedEmail);
  if (!user) {
    return genericResponse;
  }

  const rawResetToken = generateSecureToken();
  const tokenHash = hashToken(rawResetToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await authTokenModel.invalidateTokens(user.userId, "PASSWORD_RESET", client);
    await authTokenModel.createToken(
      {
        userId: user.userId,
        tokenHash,
        tokenType: "PASSWORD_RESET",
        expiresAt,
      },
      client
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  emitNotificationEvent(NOTIFICATION_EVENTS.PASSWORD_RESET_REQUESTED, {
    userId: user.userId,
    email: user.email,
    name: user.name,
    token: rawResetToken,
    expiresAt,
  });

  logger.info({ userId: user.userId }, "Password reset requested");

  return genericResponse;
};

/**
 * Reset user password with token
 */
const resetPassword = async ({ token, newPassword }) => {
  const tokenHash = hashToken(token);

  const tokenRecord = await authTokenModel.findTokenByHash(tokenHash, "PASSWORD_RESET");
  if (!tokenRecord || tokenRecord.usedAt || new Date(tokenRecord.expiresAt) < new Date()) {
    throw new UnauthorizedError("Invalid or expired password reset token", "INVALID_TOKEN");
  }

  const user = await userModel.findUserById(tokenRecord.userId);
  if (!user) {
    throw new NotFoundError("User account not found", "USER_NOT_FOUND");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await userModel.updateUserPassword(user.userId, newPasswordHash, client);
    await authTokenModel.markTokenUsed(tokenRecord.tokenId, client);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  emitNotificationEvent(NOTIFICATION_EVENTS.PASSWORD_CHANGED, {
    userId: user.userId,
    email: user.email,
  });

  logger.info({ userId: user.userId }, "Password reset completed successfully");

  return {
    message: "Password has been reset successfully",
  };
};

/**
 * Change password for authenticated user
 */
const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new NotFoundError("User account not found", "USER_NOT_FOUND");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    logger.warn({ userId }, "Change password failed: Incorrect current password");
    throw new InvalidCredentialsError("Current password is incorrect");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userModel.updateUserPassword(userId, newPasswordHash);

  emitNotificationEvent(NOTIFICATION_EVENTS.PASSWORD_CHANGED, {
    userId: user.userId,
    email: user.email,
  });

  logger.info({ userId }, "Password changed successfully");

  return {
    message: "Password changed successfully",
  };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  sanitizeUser,
};