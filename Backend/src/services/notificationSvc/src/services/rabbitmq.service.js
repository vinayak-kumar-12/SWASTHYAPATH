const crypto = require("crypto");
const logger = require("../utils/logger");
const {
  connectRabbitMQ,
  getChannel,
  closeRabbitMQ,
  getRabbitMQConfig,
} = require("../config/rabbitmq");
const { processNotificationEvent } = require("./notification.service");

let consumerTag = null;
let isConsuming = false;

/**
 * Asserts exchanges, queues, dead-letter exchanges/queues and bindings.
 */
const initializeRabbitMQ = async () => {
  const { channel, config } = await connectRabbitMQ();

  if (!channel) {
    throw new Error("Cannot initialize RabbitMQ topology: Channel is null");
  }

  const { exchange, exchangeType, queue, routingKey, dlx, dlq, prefetch } = config;

  logger.info({ exchange, exchangeType }, "Asserting main exchange...");
  await channel.assertExchange(exchange, exchangeType, { durable: true });

  logger.info({ dlx }, "Asserting Dead-Letter Exchange (DLX)...");
  await channel.assertExchange(dlx, "topic", { durable: true });

  logger.info({ dlq }, "Asserting Dead-Letter Queue (DLQ)...");
  await channel.assertQueue(dlq, { durable: true });

  logger.info({ dlq, dlx, routingKey }, "Binding DLQ to DLX...");
  await channel.bindQueue(dlq, dlx, routingKey);
  await channel.bindQueue(dlq, dlx, "#");

  logger.info({ queue, dlx, routingKey }, "Asserting main queue with DLX bindings...");
  await channel.assertQueue(queue, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": dlx,
      "x-dead-letter-routing-key": routingKey,
    },
  });

  logger.info({ queue, exchange, routingKey }, "Binding main queue to exchange...");
  await channel.bindQueue(queue, exchange, routingKey);

  logger.info({ prefetch }, "Configuring channel prefetch count...");
  await channel.prefetch(prefetch);

  logger.info("RabbitMQ topology initialized successfully");
  return { channel, config };
};

/**
 * Standard event publisher using structured JSON envelope
 */
const publishEvent = async (routingKey, eventPayload, options = {}) => {
  if (!routingKey || typeof routingKey !== "string") {
    throw new Error("Routing key is required for publishing event");
  }

  const { channel, config } = await connectRabbitMQ();
  if (!channel) {
    throw new Error("Cannot publish event: RabbitMQ channel is null");
  }

  const envelope = {
    eventId: eventPayload.eventId || crypto.randomUUID(),
    eventType: eventPayload.eventType || eventPayload.event || "UNKNOWN_EVENT",
    version: eventPayload.version || 1,
    timestamp: new Date().toISOString(),
    source: eventPayload.source || "notification-service",
    data: eventPayload.data || eventPayload,
  };

  const contentBuffer = Buffer.from(JSON.stringify(envelope), "utf-8");
  const publishOptions = {
    persistent: true,
    contentType: "application/json",
    messageId: envelope.eventId,
    timestamp: Date.now(),
    ...options,
  };

  const targetExchange = options.exchange || config.exchange;
  const published = channel.publish(targetExchange, routingKey, contentBuffer, publishOptions);

  if (published) {
    logger.info(
      {
        eventId: envelope.eventId,
        eventType: envelope.eventType,
        routingKey,
        exchange: targetExchange,
      },
      "RabbitMQ event published successfully"
    );
  } else {
    logger.warn({ eventId: envelope.eventId, routingKey }, "RabbitMQ publish buffer full");
  }

  return { published, envelope };
};

/**
 * Acknowledges a successfully processed message
 */
const acknowledgeMessage = (msg) => {
  const channel = getChannel();
  if (channel && msg) {
    channel.ack(msg);
  }
};

/**
 * Rejects a failed message.
 * If requeue is false, message is routed to configured DLX -> DLQ.
 */
const rejectMessage = (msg, requeue = false) => {
  const channel = getChannel();
  if (channel && msg) {
    channel.nack(msg, false, requeue);
  }
};

/**
 * Consumes messages from notification queue
 */
const consume = async (onMessageCallback) => {
  const { channel, config } = await initializeRabbitMQ();

  logger.info({ queue: config.queue }, "Starting RabbitMQ consumer subscriber...");

  const result = await channel.consume(
    config.queue,
    async (msg) => {
      if (!msg) {
        logger.warn("Received empty/null RabbitMQ message frame");
        return;
      }

      let eventData;
      try {
        const contentStr = msg.content.toString("utf-8");
        eventData = JSON.parse(contentStr);
      } catch (parseError) {
        logger.error(
          { err: parseError.message },
          "Malformed JSON payload received on RabbitMQ queue. Rejecting to DLQ."
        );
        // Reject malformed JSON without requeue so it is safely routed to DLQ
        rejectMessage(msg, false);
        return;
      }

      if (onMessageCallback && typeof onMessageCallback === "function") {
        await onMessageCallback(msg, eventData);
      } else {
        await handleConsumedNotificationEvent(msg, eventData, config);
      }
    },
    { noAck: false }
  );

  consumerTag = result.consumerTag;
  isConsuming = true;
  return result;
};

/**
 * Default message processing flow with idempotency, retries, and DLQ routing
 */
const handleConsumedNotificationEvent = async (msg, eventEnvelope, config) => {
  const eventData = {
    event: eventEnvelope.eventType || eventEnvelope.event,
    eventId: eventEnvelope.eventId,
    userId: eventEnvelope.data?.userId || eventEnvelope.userId,
    recipient:
      eventEnvelope.data?.recipient ||
      eventEnvelope.data?.email ||
      eventEnvelope.recipient ||
      eventEnvelope.email,
    email: eventEnvelope.data?.email || eventEnvelope.email,
    name: eventEnvelope.data?.name || eventEnvelope.name,
    verificationToken: eventEnvelope.data?.verificationToken || eventEnvelope.verificationToken,
    resetToken: eventEnvelope.data?.resetToken || eventEnvelope.resetToken,
    token: eventEnvelope.data?.token || eventEnvelope.token,
    expiresAt: eventEnvelope.data?.expiresAt || eventEnvelope.expiresAt,
    ...eventEnvelope.data,
  };

  logger.info(
    {
      eventId: eventEnvelope.eventId,
      eventType: eventEnvelope.eventType || eventEnvelope.event,
      userId: eventData.userId,
    },
    "Processing consumed RabbitMQ notification message"
  );

  try {
    await processNotificationEvent(eventData);
    acknowledgeMessage(msg);
    logger.info(
      { eventId: eventEnvelope.eventId, userId: eventData.userId },
      "Message successfully processed and ACKed"
    );
  } catch (processingError) {
    logger.error(
      {
        eventId: eventEnvelope.eventId,
        err: processingError.message,
      },
      "Error during event processing"
    );

    // Calculate total delivery/retry attempts
    const headers = msg.properties.headers || {};
    const xDeath = headers["x-death"];
    const deathCount = xDeath && xDeath[0] ? xDeath[0].count : 0;
    const retryCountHeader = headers["x-retry-count"] || 0;
    const totalAttempts = Math.max(deathCount, retryCountHeader) + 1;
    const maxRetries = config.maxRetries;

    if (totalAttempts >= maxRetries) {
      logger.warn(
        { totalAttempts, maxRetries, eventId: eventEnvelope.eventId },
        "Max retry attempts reached. Rejecting message to DLQ without requeue."
      );
      rejectMessage(msg, false); // NACK without requeue -> sends to DLX/DLQ
    } else {
      logger.info(
        { totalAttempts, maxRetries, eventId: eventEnvelope.eventId },
        "NACKing message to requeue for retry attempt"
      );
      rejectMessage(msg, true); // NACK with requeue -> retries
    }
  }
};

const startNotificationConsumer = async () => {
  return consume();
};

const stopNotificationConsumer = async () => {
  const channel = getChannel();
  if (isConsuming && channel && consumerTag) {
    try {
      await channel.cancel(consumerTag).catch(() => {});
      logger.info({ consumerTag }, "Cancelled RabbitMQ consumer tag");
    } catch (err) {
      logger.error({ err: err.message }, "Error cancelling RabbitMQ consumer");
    }
  }
  isConsuming = false;
  consumerTag = null;
  await closeRabbitMQ();
};

module.exports = {
  initializeRabbitMQ,
  publishEvent,
  consume,
  acknowledgeMessage,
  rejectMessage,
  startNotificationConsumer,
  stopNotificationConsumer,
  closeRabbitMQ,
};

