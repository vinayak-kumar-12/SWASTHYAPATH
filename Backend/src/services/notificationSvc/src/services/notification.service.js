const crypto = require("crypto");
const logger = require("../utils/logger");
const {
  Notification,
  NOTIFICATION_TYPES,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUS,
} = require("../models/notification.model");
const emailService = require("./email.service");

/**
 * Normalizes event types to internal NOTIFICATION_TYPES enum
 */
const normalizeEventType = (event, eventData = {}) => {
  switch (event) {
    case "EMAIL_VERIFICATION_REQUESTED":
    case "USER_EMAIL_VERIFICATION_REQUESTED":
    case "RESEND_VERIFICATION_REQUESTED":
      return NOTIFICATION_TYPES.EMAIL_VERIFICATION;
    case "PASSWORD_RESET_REQUESTED":
      return NOTIFICATION_TYPES.PASSWORD_RESET;
    case "USER_REGISTERED":
      if (eventData.verificationToken || eventData.token) {
        return NOTIFICATION_TYPES.EMAIL_VERIFICATION;
      }
      return NOTIFICATION_TYPES.WELCOME_EMAIL;
    case "EMAIL_VERIFIED":
    case "USER_EMAIL_VERIFIED":
    case "USER_WELCOME":
    case "WELCOME_EMAIL":
      return NOTIFICATION_TYPES.WELCOME_EMAIL;
    default:
      return null;
  }
};


const sanitizePayloadForStorage = (payload) => {
  if (!payload || typeof payload !== "object") return {};
  const sanitized = { ...payload };
  delete sanitized.verificationToken;
  delete sanitized.resetToken;
  delete sanitized.token;
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.accessToken;
  delete sanitized.refreshToken;
  return sanitized;
};


const buildFrontendUrl = (pathEnv, defaultPath, tokenKey, tokenValue) => {
  const baseUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
  const path = (process.env[pathEnv] || defaultPath).replace(/^\/?/, "/");
  return `${baseUrl}${path}?${tokenKey}=${encodeURIComponent(tokenValue)}`;
};


const processNotificationEvent = async (eventData) => {
  if (!eventData || typeof eventData !== "object") {
    throw new Error("Invalid event payload: expected non-null object");
  }

  const { event, eventId, userId, recipient, email, name } = eventData;
  const targetRecipient = recipient || email;
  const notificationType = normalizeEventType(event, eventData);

  if (!notificationType) {
    logger.warn({ event }, "Received unhandled or invalid event type");
    throw new Error(`Unsupported notification event type: ${event}`);
  }

  if (!userId || !targetRecipient) {
    logger.error({ userId, targetRecipient }, "Missing required notification routing info");
    throw new Error("Missing required event fields: userId and recipient/email are required");
  }

  // Idempotency check: Check if eventId has already been processed or is currently sent
  if (eventId) {
    const existingNotification = await Notification.findOne({ eventId });
    if (existingNotification) {
      if (existingNotification.status === NOTIFICATION_STATUS.SENT) {
        logger.info(
          { eventId, notificationId: existingNotification.notificationId },
          "Duplicate event received and already SENT. Skipping duplicate sending."
        );
        return existingNotification;
      }
      if (existingNotification.status === NOTIFICATION_STATUS.PROCESSING) {
        logger.info(
          { eventId, notificationId: existingNotification.notificationId },
          "Event currently in PROCESSING state. Skipping parallel duplicate execution."
        );
        return existingNotification;
      }
    }
  }

  const maxAttempts = parseInt(process.env.MAX_EMAIL_ATTEMPTS || "3", 10);
  const notificationId = crypto.randomUUID();
  const sanitizedPayload = sanitizePayloadForStorage(eventData);

  let subject = "SWASTHYAPATH Notification";
  let template = notificationType.toLowerCase();

  // Create initial PENDING record in MongoDB
  const notificationRecord = new Notification({
    notificationId,
    eventId: eventId || undefined,
    userId,
    type: notificationType,
    channel: NOTIFICATION_CHANNELS.EMAIL,
    recipient: targetRecipient,
    subject,
    template,
    payload: sanitizedPayload,
    status: NOTIFICATION_STATUS.PENDING,
    attempts: 0,
    maxAttempts,
  });

  await notificationRecord.save();
  logger.info(
    { notificationId, type: notificationType, userId },
    "Notification PENDING record created in MongoDB"
  );

  // Transition to PROCESSING
  notificationRecord.status = NOTIFICATION_STATUS.PROCESSING;
  notificationRecord.attempts += 1;
  notificationRecord.lastAttemptAt = new Date();
  await notificationRecord.save();

  try {
    let emailResult = null;

    if (notificationType === NOTIFICATION_TYPES.EMAIL_VERIFICATION) {
      const rawToken = eventData.verificationToken || eventData.token;
      if (!rawToken) {
        throw new Error("Missing verificationToken in EMAIL_VERIFICATION event");
      }
      const verificationUrl = buildFrontendUrl(
        "EMAIL_VERIFICATION_PATH",
        "/verify-email",
        "token",
        rawToken
      );
      notificationRecord.subject = "Verify your SWASTHYAPATH account";
      emailResult = await emailService.sendVerificationEmail({
        to: targetRecipient,
        name: name || "User",
        verificationUrl,
        expiresAt: eventData.expiresAt,
      });
    } else if (notificationType === NOTIFICATION_TYPES.PASSWORD_RESET) {
      const rawToken = eventData.resetToken || eventData.token;
      if (!rawToken) {
        throw new Error("Missing resetToken in PASSWORD_RESET event");
      }
      const resetUrl = buildFrontendUrl(
        "PASSWORD_RESET_PATH",
        "/reset-password",
        "token",
        rawToken
      );
      notificationRecord.subject = "Reset your SWASTHYAPATH password";
      emailResult = await emailService.sendPasswordResetEmail({
        to: targetRecipient,
        name: name || "User",
        resetUrl,
        expiresAt: eventData.expiresAt,
      });
    } else if (notificationType === NOTIFICATION_TYPES.WELCOME_EMAIL) {
      notificationRecord.subject = "Welcome to SWASTHYAPATH";
      emailResult = await emailService.sendWelcomeEmail({
        to: targetRecipient,
        name: name || "User",
      });
    }

    // Update notification record on success
    notificationRecord.status = NOTIFICATION_STATUS.SENT;
    notificationRecord.sentAt = new Date();
    notificationRecord.messageId = emailResult ? emailResult.messageId : null;
    await notificationRecord.save();

    logger.info(
      { notificationId, recipient: targetRecipient, type: notificationType },
      "Notification processed and SENT successfully"
    );

    return notificationRecord;
  } catch (error) {
    logger.error(
      { notificationId, attempts: notificationRecord.attempts, err: error.message },
      "Email delivery failed during notification processing"
    );

    // Record failure status
    notificationRecord.status = NOTIFICATION_STATUS.FAILED;
    notificationRecord.failedAt = new Date();
    notificationRecord.error = {
      message: error.message,
      timestamp: new Date(),
    };
    await notificationRecord.save();

    throw error;
  }
};


const getUserNotificationHistory = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find({ userId })
      .select("-payload.verificationToken -payload.resetToken -payload.token")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId }),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  normalizeEventType,
  sanitizePayloadForStorage,
  buildFrontendUrl,
  processNotificationEvent,
  getUserNotificationHistory,
};
