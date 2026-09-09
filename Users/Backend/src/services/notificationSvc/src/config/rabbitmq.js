const amqp = require("amqplib");
const logger = require("../utils/logger");

let connection = null;
let channel = null;
let isConnecting = false;

const getRabbitMQConfig = () => ({
  url: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
  exchange: process.env.RABBITMQ_EXCHANGE || "swastyapath.events",
  exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || "topic",
  queue: process.env.RABBITMQ_QUEUE || "notification-service",
  routingKey: process.env.RABBITMQ_ROUTING_KEY || "notification.email",
  dlx: process.env.RABBITMQ_DLX || "swastyapath.dlx",
  dlq: process.env.RABBITMQ_DLQ || "notification-service.dlq",
  prefetch: parseInt(process.env.RABBITMQ_PREFETCH || "10", 10),
  maxRetries: parseInt(process.env.RABBITMQ_MAX_RETRIES || "3", 10),
  heartbeat: parseInt(process.env.RABBITMQ_HEARTBEAT || "60", 10),
  reconnectDelay: parseInt(process.env.RABBITMQ_RECONNECT_DELAY || "5000", 10),
});

/**
 * Establishes or returns existing RabbitMQ connection and channel safely.
 */
const connectRabbitMQ = async () => {
  if (connection && channel) {
    return { connection, channel, config: getRabbitMQConfig() };
  }

  if (isConnecting) {
    logger.warn("RabbitMQ connection attempt already in progress");
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (connection && channel) {
      return { connection, channel, config: getRabbitMQConfig() };
    }
  }

  isConnecting = true;
  const config = getRabbitMQConfig();

  try {
    logger.info({ heartbeat: config.heartbeat }, "Connecting to RabbitMQ server...");

    connection = await amqp.connect(config.url, { heartbeat: config.heartbeat });

    connection.on("error", (err) => {
      logger.error({ err: err.message }, "RabbitMQ connection error encountered");
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
      connection = null;
      channel = null;
    });

    channel = await connection.createChannel();

    channel.on("error", (err) => {
      logger.error({ err: err.message }, "RabbitMQ channel error encountered");
    });

    channel.on("close", () => {
      logger.warn("RabbitMQ channel closed");
      channel = null;
    });

    logger.info("RabbitMQ connection and channel initialized successfully");
    isConnecting = false;
    return { connection, channel, config };
  } catch (error) {
    isConnecting = false;
    connection = null;
    channel = null;
    logger.error({ err: error.message }, "Failed to establish RabbitMQ connection");
    throw error;
  }
};

const getChannel = () => channel;
const getConnection = () => connection;
const isRabbitMQConnected = () => Boolean(connection && channel);

const closeRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close().catch(() => {});
      channel = null;
      logger.info("RabbitMQ channel closed gracefully");
    }
    if (connection) {
      await connection.close().catch(() => {});
      connection = null;
      logger.info("RabbitMQ connection closed gracefully");
    }
  } catch (error) {
    logger.error({ err: error.message }, "Error encountered during RabbitMQ shutdown");
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  getConnection,
  isRabbitMQConnected,
  closeRabbitMQ,
  getRabbitMQConfig,
};

