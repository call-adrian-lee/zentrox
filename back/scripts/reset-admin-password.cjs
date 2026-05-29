/**
 * Reset admin password hash only (no seed data).
 * Usage: ADMIN_BOOTSTRAP_PASSWORD='your-password' node scripts/reset-admin-password.cjs
 * Optional: ADMIN_BOOTSTRAP_USERNAME=admin (default)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { getPool } = require('../db');

async function main() {
  const username = String(process.env.ADMIN_BOOTSTRAP_USERNAME || 'admin').trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password || !String(password).trim()) {
    console.error('[reset-admin-password] Set ADMIN_BOOTSTRAP_PASSWORD in the environment.');
    process.exit(1);
  }

  const pool = getPool();
  const hash = await bcrypt.hash(String(password), 12);
  const [result] = await pool.query(
    `INSERT INTO admin_users (username, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [username, hash]
  );

  const updated = result.affectedRows > 0;
  if (!updated) {
    console.error('[reset-admin-password] No row updated — is MySQL running and schema applied?');
    process.exit(1);
  }
  console.log(`[reset-admin-password] OK — admin username: ${username}`);
}

main().catch((e) => {
  console.error('[reset-admin-password] Failed:', e.message || e);
  process.exit(1);
});
