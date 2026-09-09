const { Pool } = require("pg");
const logger = require("../utils/logger");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "SWASTYAPATH-PATIENT",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "1234",
  max: parseInt(process.env.DB_POOL_MAX || "20", 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "30000", 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || "5000", 10),
});

pool.on("error", (err) => {
  logger.error({ err: err.message }, "Unexpected idle PostgreSQL client pool error");
});

const initializeTables = async () => {
  const client = await pool.connect();
  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS patient;");
    await client.query(`
      CREATE TABLE IF NOT EXISTS patient.patients (
        patient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        date_of_birth DATE,
        gender VARCHAR(30),
        phone VARCHAR(20),
        email VARCHAR(255),
        preferred_language VARCHAR(50),
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        emergency_contact_name VARCHAR(150),
        emergency_contact_phone VARCHAR(20),
        profile_image_url TEXT,
        status VARCHAR(30) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_patients_email ON patient.patients (email);
      CREATE INDEX IF NOT EXISTS idx_patients_phone ON patient.patients (phone);
    `);
    logger.info("Patient database schema and tables initialized successfully");
  } catch (err) {
    logger.error({ err: err.message }, "Failed to initialize patient database schema");
    throw err;
  } finally {
    client.release();
  }
};

const connectDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    logger.info({ serverTime: res.rows[0].now }, "Connected to PostgreSQL patient database successfully");
    await initializeTables();
  } catch (err) {
    logger.error({ err: err.message }, "Database connection failed");
    throw err;
  }
};

const query = (text, params) => pool.query(text, params);

const closeDB = async () => {
  await pool.end();
  logger.info("PostgreSQL client pool closed");
};

module.exports = {
  pool,
  query,
  connectDB,
  closeDB,
};
