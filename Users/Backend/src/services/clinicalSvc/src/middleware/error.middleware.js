const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV === "development";

  // Avoid logging raw stack trace in production or exposing sensitive secrets
  logger.error(
    {
      statusCode,
      err: err.message,
      code: err.code || "INTERNAL_ERROR",
      path: req.originalUrl,
      method: req.method,
      stack: isDevelopment ? err.stack : undefined,
    },
    "Clinical Service Exception"
  );

  // Return clean JSON response
  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500 && !isDevelopment
        ? "An unexpected internal server error occurred"
        : err.message || "Internal server error",
    code: err.code || "INTERNAL_ERROR",
    ...(err.details && err.details.length > 0 && { details: err.details }),
    ...(isDevelopment && { stack: err.stack }),
  });
};

module.exports = errorHandler;
