const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: "ROUTE_NOT_FOUND",
  });
};

module.exports = notFoundHandler;
