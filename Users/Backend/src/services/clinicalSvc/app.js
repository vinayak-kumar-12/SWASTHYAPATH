const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const pinoHttp = require("pino-http");
const logger = require("./src/utils/logger");
const clinicalRoutes = require("./src/routes/clinical.routes");
const notFoundHandler = require("./src/middleware/notFound.middleware");
const errorHandler = require("./src/middleware/error.middleware");
const { isDatabaseConnected } = require("./src/config/database");

const app = express();

// Security Headers
app.use(helmet());
app.use(compression());

// CORS Configuration matching existing services
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// HTTP Logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === "/health" || req.url === "/ready",
    },
  })
);

// Request Parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Health Checks
app.get("/health", (req, res) => {
  const dbStatus = isDatabaseConnected();
  res.status(dbStatus ? 200 : 503).json({
    success: dbStatus,
    status: dbStatus ? "UP" : "DEGRADED",
    service: "clinical-svc",
    timestamp: new Date().toISOString(),
    database: dbStatus ? "connected" : "disconnected",
  });
});

app.get("/ready", (req, res) => {
  res.status(200).json({
    success: true,
    status: "READY",
    service: "clinical-svc",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1/clinical", clinicalRoutes);

// Fallback Route & Global Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
