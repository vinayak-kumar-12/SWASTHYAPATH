const { ValidationError } = require("../utils/errors");

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
    return next(new ValidationError("Request validation failed", details));
  }
  req.body = result.data;
  next();
};

module.exports = {
  validateBody,
};
