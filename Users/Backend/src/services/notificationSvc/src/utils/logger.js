const pino = require("pino");

const isDevelopment = process.env.NODE_ENV !== "production";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "password",
      "password_hash",
      "passwordHash",
      "verificationToken",
      "resetToken",
      "token",
      "accessToken",
      "refreshToken",
      "*.password",
      "*.password_hash",
      "*.passwordHash",
      "*.verificationToken",
      "*.resetToken",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
      "SMTP_PASSWORD",
      "MONGO_URI",
      "RABBITMQ_URL",
      "headers.authorization",
      "headers.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
  transport:
    isDevelopment && process.env.NODE_ENV !== "test"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

module.exports = logger;
