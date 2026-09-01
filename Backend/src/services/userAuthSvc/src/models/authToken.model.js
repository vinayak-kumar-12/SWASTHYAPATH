const { query } = require("../config/database");

/**
 * Initialize table auth.auth_tokens if it does not exist
 */
const initAuthTokensTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS auth.auth_tokens (
      token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(user_id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      token_type VARCHAR(50) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_auth_tokens_token_hash ON auth.auth_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id ON auth.auth_tokens(user_id);
  `;
  await query(sql);
};

const formatTokenRow = (row) => {
  if (!row) return null;
  return {
    tokenId: row.token_id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    tokenType: row.token_type,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
    createdAt: row.created_at,
  };
};


const createToken = async ({ userId, tokenHash, tokenType, expiresAt }, client = null) => {
  const sql = `
    INSERT INTO auth.auth_tokens (user_id, token_hash, token_type, expires_at, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING token_id, user_id, token_hash, token_type, expires_at, used_at, created_at
  `;
  const params = [userId, tokenHash, tokenType, expiresAt];
  const executor = client ? client.query.bind(client) : query;
  const result = await executor(sql, params);
  return formatTokenRow(result.rows[0]);
};


const findTokenByHash = async (tokenHash, tokenType) => {
  const sql = `
    SELECT token_id, user_id, token_hash, token_type, expires_at, used_at, created_at
    FROM auth.auth_tokens
    WHERE token_hash = $1 AND token_type = $2
    LIMIT 1
  `;
  const result = await query(sql, [tokenHash, tokenType]);
  if (result.rows.length === 0) return null;
  return formatTokenRow(result.rows[0]);
};

const markTokenUsed = async (tokenId, client = null) => {
  const sql = `
    UPDATE auth.auth_tokens
    SET used_at = NOW()
    WHERE token_id = $1
    RETURNING token_id, user_id, token_hash, token_type, expires_at, used_at, created_at
  `;
  const executor = client ? client.query.bind(client) : query;
  const result = await executor(sql, [tokenId]);
  if (result.rows.length === 0) return null;
  return formatTokenRow(result.rows[0]);
};


const invalidateTokens = async (userId, tokenType, client = null) => {
  const sql = `
    UPDATE auth.auth_tokens
    SET used_at = NOW()
    WHERE user_id = $1 AND token_type = $2 AND used_at IS NULL
  `;
  const executor = client ? client.query.bind(client) : query;
  await executor(sql, [userId, tokenType]);
};

/**
 * Delete expired tokens (maintenance helper)
 */
const deleteExpiredTokens = async () => {
  const sql = `
    DELETE FROM auth.auth_tokens
    WHERE expires_at < NOW() OR used_at IS NOT NULL
  `;
  await query(sql);
};

module.exports = {
  initAuthTokensTable,
  createToken,
  findTokenByHash,
  markTokenUsed,
  invalidateTokens,
  deleteExpiredTokens,
};
