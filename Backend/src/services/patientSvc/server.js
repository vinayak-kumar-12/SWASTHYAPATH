require("dotenv").config();
const app = require("./app");
const logger = require("./src/utils/logger");
const { connectDB, closeDB } = require("./src/config/database");
const { connectRabbitMQ, closeRabbitMQ } = require("./src/config/rabbitmq");

const PORT = parseInt(process.env.PORT || "5002", 10);
const HOST = process.env.HOST || "0.0.0.0";

let server = null;

const startServer = async () => {
  try {
    logger.info("Initializing Patient Service...");

    await connectDB();

    try {
      await connectRabbitMQ();
    } catch (mqErr) {
      logger.warn({ err: mqErr.message }, "RabbitMQ initialization failed; continuing with DB-only mode");
    }

    server = app.listen(PORT, HOST, () => {
      logger.info(
        { port: PORT, host: HOST, nodeEnv: process.env.NODE_ENV },
        `Patient Service listening on http://${HOST}:${PORT}`
      );
    });
  } catch (err) {
    logger.fatal({ err: err.message }, "Failed to start Patient Service");
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info({ signal }, "Graceful shutdown signal received. Shutting down Patient Service...");

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");
      await closeRabbitMQ();
      await closeDB();
      logger.info("Patient Service shutdown complete.");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown due to timeout.");
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason: reason instanceof Error ? reason.message : reason }, "Unhandled Promise Rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, "Uncaught Exception");
  gracefulShutdown("uncaughtException");
});

startServer();
