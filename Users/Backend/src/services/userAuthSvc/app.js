const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const pinoHttp = require("pino-http");
const logger = require("./src/utils/logger");
const errorHandler = require("./src/middleware/error.middleware");
const authRoutes = require("./src/routes/auth.routes");

const app = express();

// Security headers
app.disable("x-powered-by");
app.use(helmet());

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN || "*";
const allowedOrigins = corsOrigin === "*" ? "*" : corsOrigin.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// HTTP request logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/health" || req.url === "/ready",
    },
  })
);

// Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Response compression
app.use(compression());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "swastyapath-userAuthSvc",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Readiness check endpoint (verifies database and RabbitMQ connectivity)
app.get("/ready", async (req, res) => {
  const { isRabbitMQConnected } = require("./src/config/rabbitmq");
  const isMqConnected = isRabbitMQConnected();
  let isDbConnected = false;

  try {
    const { pool } = require("./src/config/database");
    await pool.query("SELECT 1");
    isDbConnected = true;
  } catch (err) {
    isDbConnected = false;
  }

  if (isDbConnected && isMqConnected) {
    return res.status(200).json({
      success: true,
      service: "swastyapath-userAuthSvc",
      status: "ready",
      database: "connected",
      rabbitmq: "connected",
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    success: false,
    service: "swastyapath-userAuthSvc",
    status: "not_ready",
    database: isDbConnected ? "connected" : "disconnected",
    rabbitmq: isMqConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/v1/auth", authRoutes);

// 404 Route Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
