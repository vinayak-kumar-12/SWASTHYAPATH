const amqp = require("amqplib");
const logger = require("../utils/logger");

let connection = null;
let channel = null;

const getRabbitMQConfig = () => ({
  url: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
  exchange: process.env.RABBITMQ_EXCHANGE || "swastyapath.events",
  exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE || "topic",
  routingKey: process.env.RABBITMQ_ROUTING_KEY || "patient.created",
});

const connectRabbitMQ = async () => {
  if (connection && channel) {
    return { connection, channel, config: getRabbitMQConfig() };
  }

  const config = getRabbitMQConfig();
  try {
    logger.info({ url: config.url.replace(/:[^:@]+@/, ":***@") }, "Connecting to RabbitMQ server...");
    connection = await amqp.connect(config.url);

    connection.on("error", (err) => {
      logger.error({ err: err.message }, "RabbitMQ connection error");
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
      connection = null;
      channel = null;
    });

    channel = await connection.createChannel();

    channel.on("error", (err) => {
      logger.error({ err: err.message }, "RabbitMQ channel error");
    });

    channel.on("close", () => {
      logger.warn("RabbitMQ channel closed");
      channel = null;
    });

    await channel.assertExchange(config.exchange, config.exchangeType, { durable: true });
    logger.info(
      { exchange: config.exchange, exchangeType: config.exchangeType },
      "RabbitMQ topic exchange asserted successfully"
    );

    return { connection, channel, config };
  } catch (err) {
    logger.error({ err: err.message }, "Failed to connect to RabbitMQ");
    connection = null;
    channel = null;
    throw err;
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
    }
    if (connection) {
      await connection.close().catch(() => {});
      connection = null;
    }
    logger.info("RabbitMQ producer connection closed");
  } catch (err) {
    logger.error({ err: err.message }, "Error closing RabbitMQ connection");
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
