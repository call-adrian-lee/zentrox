/**
 * Creates MYSQL_DATABASE if missing, applies API schema, seeds admin + sample data.
 * Idempotent: adds missing canonical leadership + portfolio tabs/items (original homepage set),
 * sample jobs only when those tables are completely empty; always ensures Recruitment Partner job exists.
 * Run from repo: npm run db:bootstrap --prefix back
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { buildMysqlConnectionConfig } = require('../lib/mysql-config');
const { getPool, ensureSchema } = require('../db');
const { seedCanonicalHomepageContent } = require('../seed-canonical.cjs');
const { ensureRecruitmentPartnerJob } = require('./seed-recruitment-partner-job.cjs');
const { seedPartnershipJobsIfEmpty } = require('./seed-partnership-jobs.cjs');

function resolveBootstrapAdmin() {
  const username = String(process.env.ADMIN_BOOTSTRAP_USERNAME || 'admin').trim().toLowerCase();
  const providedPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const generatedPassword = crypto.randomBytes(18).toString('base64url');
  const password = providedPassword && String(providedPassword).trim() ? String(providedPassword) : generatedPassword;
  const isGenerated = !providedPassword || !String(providedPassword).trim();
  return { username, password, isGenerated };
}

function safeIdent(name) {
  const s = String(name || '').replace(/[^a-zA-Z0-9_]/g, '');
  return s || 'zentrox';
}

async function main() {
  const dbName = safeIdent(process.env.MYSQL_DATABASE || 'zentrox');

  const root = await mysql.createConnection(buildMysqlConnectionConfig());
  await root.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await root.end();

  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await ensureSchema(conn);
  } finally {
    conn.release();
  }

  const admin = resolveBootstrapAdmin();
  const adminHash = await bcrypt.hash(admin.password, 12);
  const forceAdminPassword =
    process.env.ADMIN_BOOTSTRAP_FORCE === '1' || process.env.ADMIN_BOOTSTRAP_FORCE === 'true';
  if (forceAdminPassword) {
    await pool.query(
      `INSERT INTO admin_users (username, password_hash) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [admin.username, adminHash]
    );
  } else {
    await pool.query(`INSERT IGNORE INTO admin_users (username, password_hash) VALUES (?, ?)`, [
      admin.username,
      adminHash
    ]);
  }

  if (await seedPartnershipJobsIfEmpty(pool)) {
    console.log('[bootstrap] Seeded 3 published partnership jobs for /open-roles.');
  }

  if (await ensureRecruitmentPartnerJob(pool)) {
    console.log('[bootstrap] Added Recruitment Partner (High Commission) job.');
  }

  await seedCanonicalHomepageContent(pool, '[bootstrap]');

  if (admin.isGenerated) {
    console.log(`[bootstrap] Admin password auto-generated (save now): ${admin.password}`);
  }
  console.log(`[bootstrap] OK — admin: ${admin.username}  |  DB: ${dbName}`);
}

main().catch((e) => {
  console.error('[bootstrap] Failed:', e.message);
  process.exit(1);
});
