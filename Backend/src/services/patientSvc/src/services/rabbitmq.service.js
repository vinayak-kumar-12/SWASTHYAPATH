const crypto = require("crypto");
const logger = require("../utils/logger");
const { connectRabbitMQ } = require("../config/rabbitmq");

const publishPatientEvent = async (routingKey, eventType, data) => {
  try {
    const { channel, config } = await connectRabbitMQ();
    if (!channel) {
      logger.warn({ eventType }, "RabbitMQ channel unavailable; skipping event publish");
      return false;
    }

    const envelope = {
      eventId: crypto.randomUUID(),
      eventType,
      version: 1,
      timestamp: new Date().toISOString(),
      source: "patient-service",
      data,
    };

    const contentBuffer = Buffer.from(JSON.stringify(envelope), "utf-8");
    const published = channel.publish(config.exchange, routingKey, contentBuffer, {
      persistent: true,
      contentType: "application/json",
      messageId: envelope.eventId,
      timestamp: Date.now(),
    });

    if (published) {
      logger.info(
        { eventId: envelope.eventId, eventType, routingKey },
        "Patient domain event published successfully over RabbitMQ"
      );
    } else {
      logger.warn({ eventId: envelope.eventId, eventType }, "RabbitMQ publish buffer full");
    }

    return published;
  } catch (err) {
    logger.error({ eventType, err: err.message }, "Failed to publish patient domain event to RabbitMQ");
    return false;
  }
};

module.exports = {
  publishPatientEvent,
};
