/**
 * Idempotent: inserts the Recruitment Partner job if missing (matched by exact title).
 * Run: node scripts/seed-recruitment-partner-job.cjs  (from back/)
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const TITLE = 'Recruitment Partner (High Commission)';

const DESCRIPTION = `We are a growing IT services company building custom software solutions for global clients. As we expand into the US and LATAM markets, we are looking for Recruitment Partners to help us identify and connect high-quality candidates for key growth roles.

This is a flexible, performance-based partnership with strong earning potential and no commission cap.

No recruitment experience is required — success comes from strong communication, good judgment, and access to people.

Responsibilities:

• Identify and refer candidates for the following roles:
– US-Based GTM / Business Development Partner
– US-Based Upwork Growth Partner
– LATAM-Based Upwork Growth Partner

• Reach out to potential candidates through your network or platforms
• Present opportunities in a clear and professional way
• Do basic screening for interest and fit (communication + motivation)
• Coordinate introductions with our internal team

Requirements:

• Strong communication and people skills
• Ability to recognize talent and role fit
• Active network in US and/or LATAM (preferred)
• Self-driven and consistent execution mindset
• No prior recruitment experience required

Compensation:

• Commission per successful hire
• Higher % for stronger or fully qualified candidates
• No earning cap

How to Apply:

Click Apply and send a short message including:

• Your network (US, LATAM, or both)
• Why you are interested in this role`;

const LOCATION = 'Remote (US / LATAM)';
const EMPLOYMENT_TYPE = 'Partner';

/** @param {import('mysql2/promise').Pool} pool */
async function ensureRecruitmentPartnerJob(pool) {
  const [rows] = await pool.query('SELECT id FROM jobs WHERE title = ? LIMIT 1', [TITLE]);
  if (rows.length) return false;
  await pool.query(
    `INSERT INTO jobs (title, description, location, employment_type, status)
     VALUES (?, ?, ?, ?, 'published')`,
    [TITLE, DESCRIPTION, LOCATION, EMPLOYMENT_TYPE]
  );
  return true;
}

async function main() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'zentrox',
    waitForConnections: true,
    connectionLimit: 5
  });
  try {
    const inserted = await ensureRecruitmentPartnerJob(pool);
    console.log(inserted ? `[seed-job] Inserted: ${TITLE}` : `[seed-job] Already exists: ${TITLE}`);
  } finally {
    await pool.end();
  }
}

module.exports = { ensureRecruitmentPartnerJob, TITLE };

if (require.main === module) {
  main().catch((e) => {
    console.error('[seed-job] Failed:', e.message);
    process.exit(1);
  });
}
