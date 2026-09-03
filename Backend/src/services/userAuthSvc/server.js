require("dotenv").config();

const http = require("http");
const app = require("./app");
const { connectDB, closeDB } = require("./src/config/database");
const logger = require("./src/utils/logger");

const { connectRabbitMQ, closeRabbitMQ } = require("./src/config/rabbitmq");

const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, "Received shutdown signal. Starting graceful shutdown...");

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "Error closing HTTP server");
    } else {
      logger.info("HTTP server stopped accepting new connections");
    }

    try {
      await closeRabbitMQ();
      await closeDB();
      logger.info("Graceful shutdown completed. Exiting process.");
      process.exit(0);
    } catch (dbErr) {
      logger.error({ err: dbErr }, "Error closing connections during shutdown");
      process.exit(1);
    }
  });

  // Force exit if graceful shutdown takes longer than 10s
  setTimeout(() => {
    logger.error("Graceful shutdown timeout exceeded (10s). Forcing exit.");
    process.exit(1);
  }, 10000).unref();
};

const startServer = async () => {
  try {
    // Connect to PostgreSQL database pool
    await connectDB();

    // Connect to RabbitMQ publisher
    try {
      await connectRabbitMQ();
      logger.info("RabbitMQ event publisher initialized for UserAuth service");
    } catch (mqErr) {
      logger.error({ err: mqErr.message }, "RabbitMQ connection warning on startup. Service running HTTP APIs.");
    }

    server.listen(PORT, HOST, () => {
      logger.info(`SWASTHYAPATH UserAuth microservice running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start UserAuth service");
    process.exit(1);
  }
};

// Process event handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception detected!");
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.fatal({ reason, promise }, "Unhandled Rejection detected!");
  gracefulShutdown("unhandledRejection");
});

startServer();

module.exports = server;
