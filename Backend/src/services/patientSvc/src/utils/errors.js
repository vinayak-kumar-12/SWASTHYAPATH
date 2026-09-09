class AppError extends Error {
  constructor(message, statusCode, code = "INTERNAL_ERROR", details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad Request", code = "BAD_REQUEST", details = []) {
    super(message, 400, code, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", code = "UNAUTHORIZED", details = []) {
    super(message, 401, code, details);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN", details = []) {
    super(message, 403, code, details);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND", details = []) {
    super(message, 404, code, details);
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource conflict", code = "CONFLICT", details = []) {
    super(message, 409, code, details);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed", details = []) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
};
