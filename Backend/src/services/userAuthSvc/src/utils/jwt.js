const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./errors");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default_access_secret_change_me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default_refresh_secret_change_me";
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";


const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.userId,
      role: user.role,
      type: "access",
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
};


const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user.userId,
      role: user.role,
      type: "refresh",
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
};


const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    if (decoded.type !== "access") {
      throw new UnauthorizedError("Invalid token type", "INVALID_TOKEN");
    }
    return decoded;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Access token has expired", "TOKEN_EXPIRED");
    }
    throw new UnauthorizedError("Invalid access token", "INVALID_TOKEN");
  }
};


const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    if (decoded.type !== "refresh") {
      throw new UnauthorizedError("Invalid token type for refresh", "INVALID_TOKEN");
    }
    return decoded;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    if (error.name === "TokenExpiredError") {
      throw new UnauthorizedError("Refresh token has expired", "REFRESH_TOKEN_EXPIRED");
    }
    throw new UnauthorizedError("Invalid refresh token", "INVALID_TOKEN");
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
