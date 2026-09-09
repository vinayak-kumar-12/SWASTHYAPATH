const errorHandler = (err, req, res, next) => {
  req.log.error(
    {
      err,
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    "Request failed"
  );

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message:
        statusCode === 500
          ? "Internal server error"
          : err.message,
      ...(err.details && {
        details: err.details,
      }),
    },
  });
};

module.exports = errorHandler;