require("dotenv").config();
const http = require("http");
const app = require("./app");
const logger = require("./src/utils/logger");
const { connectDB, disconnectDB } = require("./src/config/database");
const {
  startNotificationConsumer,
  stopNotificationConsumer,
} = require("./src/services/rabbitmq.service");

const PORT = process.env.PORT || 5001;

let server = null;

const startServer = async () => {
  try {
    logger.info("Starting SWASTHYAPATH Notification Microservice...");

    // 1. Initialize MongoDB connection
    await connectDB();

    // 2. Connect RabbitMQ & initialize topology & start consumer
    try {
      await startNotificationConsumer();
      logger.info("RabbitMQ integration initialized & consumer active");
    } catch (mqErr) {
      logger.error(
        { err: mqErr.message },
        "RabbitMQ initialization warning on startup. Service running HTTP endpoints."
      );
    }

    // 3. Start HTTP server
    server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`SWASTHYAPATH Notification Microservice listening on port ${PORT}`);
    });
  } catch (error) {
    logger.fatal({ err: error.message }, "Fatal error during Notification service startup");
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown sequence...`);

  // 1. Stop accepting new HTTP requests
  if (server) {
    await new Promise((resolve) => {
      server.close(() => {
        logger.info("Express HTTP server closed to new connections");
        resolve();
      });
    });
  }

  try {
    // 2. Stop RabbitMQ consumer and close AMQP channels/connections
    await stopNotificationConsumer();

    // 3. Close database connections
    await disconnectDB();

    logger.info("All resources closed cleanly. Graceful shutdown complete.");
    process.exit(0);
  } catch (err) {
    logger.error({ err: err.message }, "Error encountered during graceful shutdown");
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Promise Rejection detected");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error.message, stack: error.stack }, "Uncaught Exception detected");
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

startServer();

