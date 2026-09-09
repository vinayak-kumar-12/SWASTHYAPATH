const crypto = require("crypto");

const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};


const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateSecureToken,
  hashToken,
};
