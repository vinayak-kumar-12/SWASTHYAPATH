const logger = require("./logger");
const { publishEvent } = require("../config/rabbitmq");

const NOTIFICATION_EVENTS = {
  EMAIL_VERIFICATION_REQUESTED: "EMAIL_VERIFICATION_REQUESTED",
  USER_EMAIL_VERIFICATION_REQUESTED: "EMAIL_VERIFICATION_REQUESTED",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  EMAIL_VERIFIED: "EMAIL_VERIFIED",
  USER_EMAIL_VERIFIED: "EMAIL_VERIFIED",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  USER_WELCOME: "USER_WELCOME",
};

/**
 * Publishes a notification event to RabbitMQ
 */
const emitNotificationEvent = async (eventType, payload) => {
  logger.info(
    {
      eventType,
      userId: payload.userId,
      email: payload.email,
    },
    `Notification event generated: ${eventType}`
  );

  const routingKey = process.env.RABBITMQ_ROUTING_KEY || "notification.email";
  return publishEvent(routingKey, eventType, payload);
};

module.exports = {
  NOTIFICATION_EVENTS,
  emitNotificationEvent,
};
