const { Pool } = require("pg");
const logger = require("../utils/logger");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "SWASTYAPATH-USERAUTH",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: Number(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected PostgreSQL pool background error");
});

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug({ text, duration, rows: res.rowCount }, "Executed SQL query");
    return res;
  } catch (error) {
    logger.error({ err: error, text }, "SQL query execution failed");
    throw error;
  }
};

/**
 * Test initial PostgreSQL connection
 */
const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info("PostgreSQL connection pool initialized successfully");
    client.release();
  } catch (error) {
    logger.error({ err: error }, "PostgreSQL initial connection failed");
    throw error;
  }
};


const closeDB = async () => {
  try {
    await pool.end();
    logger.info("PostgreSQL connection pool closed");
  } catch (error) {
    logger.error({ err: error }, "Error closing PostgreSQL connection pool");
  }
};

module.exports = {
  pool,
  query,
  connectDB,
  closeDB,
};
