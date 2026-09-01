const { query } = require("../config/database");

/**
 * Format raw database user row into clean JS object
 * @param {object} row - DB result row
 * @returns {object|null} formatted user object
 */
const formatUserRow = (row) => {
  if (!row) return null;
  return {
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role,
    isVerified: row.is_verified ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Ensure columns like is_verified exist in auth.users
 */
const ensureUserSchema = async () => {
  const sql = `
    ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
  `;
  await query(sql);
};

const createUser = async ({ name, email, phone, passwordHash, role }, client = null) => {
  const sql = `
    INSERT INTO auth.users (name, email, phone, password_hash, role, is_verified, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, FALSE, NOW(), NOW())
    RETURNING user_id, name, email, phone, password_hash, role, is_verified, created_at, updated_at
  `;
  const params = [name, email, phone, passwordHash, role];
  const executor = client ? client.query.bind(client) : query;
  const result = await executor(sql, params);
  return formatUserRow(result.rows[0]);
};

const findUserByEmail = async (email) => {
  const sql = `
    SELECT user_id, name, email, phone, password_hash, role, is_verified, created_at, updated_at
    FROM auth.users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `;
  const result = await query(sql, [email]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatUserRow(result.rows[0]);
};

const findUserById = async (userId) => {
  const sql = `
    SELECT user_id, name, email, phone, password_hash, role, is_verified, created_at, updated_at
    FROM auth.users
    WHERE user_id = $1
    LIMIT 1
  `;
  const result = await query(sql, [userId]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatUserRow(result.rows[0]);
};

const updateUserUpdatedAt = async (userId) => {
  const sql = `
    UPDATE auth.users
    SET updated_at = NOW()
    WHERE user_id = $1
    RETURNING user_id, name, email, phone, password_hash, role, is_verified, created_at, updated_at
  `;
  const result = await query(sql, [userId]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatUserRow(result.rows[0]);
};


const markUserEmailVerified = async (userId, client = null) => {
  const sql = `
    UPDATE auth.users
    SET is_verified = TRUE, updated_at = NOW()
    WHERE user_id = $1
    RETURNING user_id, name, email, phone, password_hash, role, is_verified, created_at, updated_at
  `;
  const executor = client ? client.query.bind(client) : query;
  const result = await executor(sql, [userId]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatUserRow(result.rows[0]);
};


const updateUserPassword = async (userId, newPasswordHash, client = null) => {
  const sql = `
    UPDATE auth.users
    SET password_hash = $2, updated_at = NOW()
    WHERE user_id = $1
    RETURNING user_id, name, email, phone, password_hash, role, is_verified, created_at, updated_at
  `;
  const executor = client ? client.query.bind(client) : query;
  const result = await executor(sql, [userId, newPasswordHash]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatUserRow(result.rows[0]);
};

module.exports = {
  ensureUserSchema,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserUpdatedAt,
  markUserEmailVerified,
  updateUserPassword,
};
