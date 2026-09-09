const pino = require("pino");

const isDevelopment = process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test";

let transport;
if (isDevelopment) {
  try {
    require.resolve("pino-pretty");
    transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    };
  } catch (err) {
    transport = undefined;
  }
}

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "headers.authorization",
      "headers.cookie",
      "req.headers.authorization",
      "req.headers.cookie",
      "accessToken",
      "refreshToken",
      "*.accessToken",
      "*.refreshToken",
    ],
    censor: "[REDACTED]",
  },
  transport,
});

module.exports = logger;
