const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const pinoHttp = require("pino-http");
const mongoose = require("mongoose");
const logger = require("./src/utils/logger");
const notificationRoutes = require("./src/routes/notification.routes");
const notFoundHandler = require("./src/middlewares/notFound.middleware");
const errorHandler = require("./src/middlewares/error.middleware");

const app = express();

// Security headers & CORS
app.use(helmet());
app.use(cors());

// Body parsing with safe limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Request logging (skipping health endpoints to reduce noise)
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/health" || req.url === "/ready",
    },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

const { isRabbitMQConnected } = require("./src/config/rabbitmq");

// Readiness check endpoint
app.get("/ready", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const isMqConnected = isRabbitMQConnected();

  if (isDbConnected && isMqConnected) {
    return res.status(200).json({
      success: true,
      status: "ready",
      database: "connected",
      rabbitmq: "connected",
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    success: false,
    status: "not_ready",
    database: isDbConnected ? "connected" : "disconnected",
    rabbitmq: isMqConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1/notifications", notificationRoutes);

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
