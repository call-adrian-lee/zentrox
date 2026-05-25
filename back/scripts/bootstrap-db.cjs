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
const { getPool, ensureSchema } = require('../db');
const { seedCanonicalHomepageContent } = require('../seed-canonical.cjs');
const { ensureRecruitmentPartnerJob } = require('./seed-recruitment-partner-job.cjs');

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

  const root = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || ''
  });
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
  await pool.query(
    `INSERT INTO admin_users (username, password_hash) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [admin.username, adminHash]
  );

  const seedJobs = [
    [
      'Upwork Partnership: Senior Full-Stack Engineer (Angular + Node)',
      'Partner with Zentrox and U.S. founders to ship production SaaS on Upwork engagements. Own Angular frontend, Node APIs, and delivery quality from scope to launch.',
      'Remote (U.S. overlap)',
      'Contract'
    ],
    [
      'Upwork Partnership: AI/Automation Engineer (APIs + Workflows)',
      'Build practical AI features and business automations for startup teams. Integrate LLM providers, external APIs, and operational workflows with strong reliability and documentation.',
      'Remote (U.S. overlap)',
      'Contract'
    ],
    [
      'Upwork Partnership: Product Delivery Engineer (MVP to Scale)',
      'Help idea owners and investors turn validated concepts into scalable products. Lead implementation across web architecture, integrations, and release readiness.',
      'Remote (U.S. overlap)',
      'Contract'
    ]
  ];

  const [jobs] = await pool.query('SELECT id FROM jobs LIMIT 1');
  if (!jobs.length) {
    await pool.query(
      `INSERT INTO jobs (title, description, location, employment_type, status)
       VALUES ?`,
      [seedJobs.map((j) => [j[0], j[1], j[2], j[3], 'published'])]
    );
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
