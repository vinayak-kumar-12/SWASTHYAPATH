const logger = require("./logger");

const NOTIFICATION_EVENTS = {
  USER_EMAIL_VERIFICATION_REQUESTED: "USER_EMAIL_VERIFICATION_REQUESTED",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  USER_EMAIL_VERIFIED: "USER_EMAIL_VERIFIED",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  USER_WELCOME: "USER_WELCOME",
};


const emitNotificationEvent = (eventType, payload) => {
  logger.info(
    {
      eventType,
      userId: payload.userId,
      email: payload.email,
      expiresAt: payload.expiresAt,
    },
    `Notification event generated: ${eventType}`
  );

  // Future RabbitMQ integration point:
  // messageBroker.publish('notifications_exchange', eventType, payload);
};

module.exports = {
  NOTIFICATION_EVENTS,
  emitNotificationEvent,
};
