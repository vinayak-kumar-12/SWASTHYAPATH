const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
  const dbName = process.env.MONGO_DB_NAME || "SWASTYAPATH-NOTIFICATION";

  const options = {
    dbName,
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  mongoose.connection.on("connected", () => {
    logger.info({ dbName }, "MongoDB connection established successfully");
  });

  mongoose.connection.on("error", (err) => {
    logger.error({ err: err.message }, "MongoDB connection error encountered");
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB connection lost / disconnected");
  });

  try {
    await mongoose.connect(mongoUri, options);
    return mongoose.connection;
  } catch (error) {
    logger.error({ err: error.message }, "Failed to connect to MongoDB");
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed gracefully");
    }
  } catch (error) {
    logger.error({ err: error.message }, "Error during MongoDB disconnection");
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
