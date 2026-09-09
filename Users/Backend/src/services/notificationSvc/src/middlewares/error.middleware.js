const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  logger.error(
    {
      statusCode,
      err: err.message,
      path: req.originalUrl,
      method: req.method,
      stack: isDevelopment ? err.stack : undefined,
    },
    "Unhandled HTTP Error"
  );

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message:
        statusCode === 500 && !isDevelopment
          ? "An unexpected error occurred. Please try again later."
          : err.message || "Internal server error",
      ...(isDevelopment && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
