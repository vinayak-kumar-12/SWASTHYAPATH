const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("./errors");

const getAccessSecret = () => process.env.JWT_ACCESS_SECRET || "8be9920e17dd8034952b95754f5212a8cac1f66d90a7121d3303ec06a59bc36d";
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || "1963095ddaad87b892f1e4ff36dfc36024149d9451d2f514678be4e5690aecf0d43f155eccd2a145";
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";


const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.userId,
      role: user.role,
      type: "access",
    },
    getAccessSecret(),
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
    getRefreshSecret(),
    { expiresIn: REFRESH_EXPIRES_IN }
  );
};


const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, getAccessSecret());
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
    const decoded = jwt.verify(token, getRefreshSecret());
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
