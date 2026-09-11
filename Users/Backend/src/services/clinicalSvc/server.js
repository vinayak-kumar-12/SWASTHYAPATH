require("dotenv").config();
const app = require("./app");
const logger = require("./src/utils/logger");
const { connectDB, closeDatabaseConnection } = require("./src/config/database");

const PORT = process.env.PORT || 5003;
const HOST = process.env.HOST || "0.0.0.0";

let server;

const startServer = async () => {
  try {
    // Attempt MongoDB connection
    const dbConnected = await connectDB();
    if (!dbConnected) {
      logger.warn("Clinical Service starting with database in fallback mode.");
    }

    server = app.listen(PORT, HOST, () => {
      logger.info(
        { port: PORT, host: HOST, env: process.env.NODE_ENV },
        `Clinical Service running on http://${HOST}:${PORT}`
      );
    });
  } catch (error) {
    logger.error({ error: error.message }, "Failed to start Clinical Service.");
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info({ signal }, "Received termination signal. Starting graceful shutdown...");

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");
      await closeDatabaseConnection();
      logger.info("Clinical Service shutdown completed successfully.");
      process.exit(0);
    });
  } else {
    await closeDatabaseConnection();
    process.exit(0);
  }

  // Force exit after 10s timeout
  setTimeout(() => {
    logger.error("Forced shutdown due to timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason: reason?.message || reason }, "Unhandled Promise Rejection.");
});

process.on("uncaughtException", (error) => {
  logger.error({ error: error.message, stack: error.stack }, "Uncaught Exception.");
  gracefulShutdown("uncaughtException");
});

startServer();
