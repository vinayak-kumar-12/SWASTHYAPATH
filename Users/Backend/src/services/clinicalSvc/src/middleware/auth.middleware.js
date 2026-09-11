const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../utils/errors");

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET ||
  "8be9920e17dd8034952b95754f5212a8cac1f66d90a7121d3303ec06a59bc36d";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedError("Access token required in Authorization header", "TOKEN_REQUIRED")
    );
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getAccessSecret());
    if (decoded.type && decoded.type !== "access") {
      return next(new UnauthorizedError("Invalid token type", "INVALID_TOKEN_TYPE"));
    }

    const userId = decoded.sub || decoded.userId || decoded.user_id || decoded.id;
    if (!userId) {
      return next(new UnauthorizedError("Token subject missing", "INVALID_TOKEN"));
    }

    req.user = {
      userId,
      user_id: userId,
      role: decoded.role || "PATIENT",
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Access token has expired", "TOKEN_EXPIRED"));
    }
    return next(new UnauthorizedError("Invalid access token", "INVALID_TOKEN"));
  }
};

module.exports = {
  authenticateToken,
};
