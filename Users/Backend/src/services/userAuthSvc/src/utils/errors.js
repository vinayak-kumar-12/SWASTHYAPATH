class AppError extends Error {
  constructor(message, statusCode, code = "INTERNAL_SERVER_ERROR", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = "Invalid request data", details = []) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

class InvalidCredentialsError extends AppError {
  constructor(message = "Invalid email or password") {
    super(message, 401, "INVALID_CREDENTIALS");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, 403, "FORBIDDEN");
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource already exists", code = "CONFLICT") {
    super(message, 409, code);
  }
}

class UserAlreadyExistsError extends AppError {
  constructor(message = "An account with this email already exists") {
    super(message, 409, "USER_ALREADY_EXISTS");
  }
}

class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER_ERROR");
  }
}

class EmailNotVerifiedError extends AppError {
  constructor(message = "Please verify your email before logging in") {
    super(message, 403, "EMAIL_NOT_VERIFIED");
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UserAlreadyExistsError,
  InternalServerError,
};
