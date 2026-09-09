const amqp = require("amqplib");
const crypto = require("crypto");
const logger = require("../utils/logger");

let connection = null;
let channel = null;
let isConnecting = false;

const getRabbitMQConfig = () => ({
  url: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
  exchange: process.env.RABBITMQ_EXCHANGE || "swastyapath.events",
  exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || "topic",
  routingKey: process.env.RABBITMQ_ROUTING_KEY || "notification.email",
});

/**
 * Establishes or returns existing RabbitMQ connection and channel for auth service.
 */
const connectRabbitMQ = async () => {
  if (connection && channel) {
    return { connection, channel, config: getRabbitMQConfig() };
  }

  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (connection && channel) {
      return { connection, channel, config: getRabbitMQConfig() };
    }
  }

  isConnecting = true;
  const config = getRabbitMQConfig();

  try {
    logger.info("Auth Service connecting to RabbitMQ...");
    connection = await amqp.connect(config.url);

    connection.on("error", (err) => {
      logger.error({ err: err.message }, "Auth Service RabbitMQ connection error");
    });

    connection.on("close", () => {
      logger.warn("Auth Service RabbitMQ connection closed");
      connection = null;
      channel = null;
    });

    channel = await connection.createChannel();

    channel.on("error", (err) => {
      logger.error({ err: err.message }, "Auth Service RabbitMQ channel error");
    });

    channel.on("close", () => {
      logger.warn("Auth Service RabbitMQ channel closed");
      channel = null;
    });

    // Assert durable topic exchange
    await channel.assertExchange(config.exchange, config.exchangeType, { durable: true });

    logger.info({ exchange: config.exchange }, "Auth Service RabbitMQ initialized successfully");
    isConnecting = false;
    return { connection, channel, config };
  } catch (error) {
    isConnecting = false;
    connection = null;
    channel = null;
    logger.error({ err: error.message }, "Auth Service failed to connect to RabbitMQ");
    throw error;
  }
};

/**
 * Publishes a structured event envelope to RabbitMQ exchange
 */
const publishEvent = async (routingKey, eventType, data, customEnvelope = {}) => {
  const targetRoutingKey = routingKey || process.env.RABBITMQ_ROUTING_KEY || "notification.email";

  try {
    const { channel, config } = await connectRabbitMQ();
    if (!channel) {
      throw new Error("Cannot publish event: RabbitMQ channel is null");
    }

    const envelope = {
      eventId: customEnvelope.eventId || crypto.randomUUID(),
      eventType: eventType || "UNKNOWN_EVENT",
      version: customEnvelope.version || 1,
      timestamp: new Date().toISOString(),
      source: "auth-service",
      data: data || {},
    };

    const contentBuffer = Buffer.from(JSON.stringify(envelope), "utf-8");
    const publishOptions = {
      persistent: true,
      contentType: "application/json",
      messageId: envelope.eventId,
      timestamp: Date.now(),
    };

    const published = channel.publish(
      config.exchange,
      targetRoutingKey,
      contentBuffer,
      publishOptions
    );

    if (published) {
      logger.info(
        {
          eventId: envelope.eventId,
          eventType: envelope.eventType,
          routingKey: targetRoutingKey,
          exchange: config.exchange,
        },
        "Auth Service published event to RabbitMQ"
      );
    } else {
      logger.warn({ eventId: envelope.eventId }, "Auth Service RabbitMQ publish buffer full");
    }

    return { published, envelope };
  } catch (error) {
    logger.error(
      { err: error.message, eventType, routingKey: targetRoutingKey },
      "Failed to publish event to RabbitMQ"
    );
    // Non-blocking fallback error log to avoid interrupting DB transaction
    return { published: false, error: error.message };
  }
};

const isRabbitMQConnected = () => Boolean(connection && channel);

const closeRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close().catch(() => {});
      channel = null;
    }
    if (connection) {
      await connection.close().catch(() => {});
      connection = null;
    }
    logger.info("Auth Service RabbitMQ closed gracefully");
  } catch (error) {
    logger.error({ err: error.message }, "Error closing Auth Service RabbitMQ");
  }
};

module.exports = {
  connectRabbitMQ,
  publishEvent,
  isRabbitMQConnected,
  closeRabbitMQ,
  getRabbitMQConfig,
};
