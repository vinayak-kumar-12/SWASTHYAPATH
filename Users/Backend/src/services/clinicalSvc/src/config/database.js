const mongoose = require("mongoose");
const logger = require("../utils/logger");

let isConnected = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "clinical_db";

  // Check if placeholder URL or unset
  if (!mongoUri || mongoUri.includes("YOUR_MONGODB_URL_HERE")) {
    const fallbackUri = `mongodb://localhost:27017/${dbName}`;
    logger.warn(
      { mongoUri, fallbackUri },
      "MONGODB_URI contains placeholder or is unset. Attempting fallback local connection."
    );

    try {
      await mongoose.connect(fallbackUri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      logger.info({ dbName }, "Successfully connected to MongoDB fallback local instance.");
      return true;
    } catch (err) {
      logger.warn(
        { error: err.message },
        "MongoDB fallback connection failed. Service running in offline/safe mode."
      );
      isConnected = false;
      return false;
    }
  }

  try {
    await mongoose.connect(mongoUri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info({ dbName }, "Successfully connected to MongoDB clinical_db database.");
    return true;
  } catch (err) {
    logger.error(
      { error: err.message },
      "Failed to connect to MongoDB. Safe failure mode enabled."
    );
    isConnected = false;
    return false;
  }
};

mongoose.connection.on("connected", () => {
  isConnected = true;
  logger.info("Mongoose connection established.");
});

mongoose.connection.on("error", (err) => {
  isConnected = false;
  logger.error({ err: err.message }, "Mongoose connection error.");
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  logger.warn("Mongoose disconnected from database.");
});

const isDatabaseConnected = () => isConnected && mongoose.connection.readyState === 1;

const closeDatabaseConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info("MongoDB database connection closed.");
  }
};

module.exports = {
  connectDB,
  isDatabaseConnected,
  closeDatabaseConnection,
};
