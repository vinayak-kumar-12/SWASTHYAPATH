const { verifyAccessToken } = require("../utils/jwt");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors");

/**
 * Authentication middleware verifying Bearer JWT
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication required", "UNAUTHORIZED");
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedError("Authentication required", "UNAUTHORIZED");
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      userId: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - Roles allowed to access endpoint
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required", "UNAUTHORIZED");
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError("You do not have permission to perform this action");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
};
