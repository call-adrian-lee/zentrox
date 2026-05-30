/**
 * Idempotent: seeds Upwork partnership jobs when the jobs table is empty.
 * Used by bootstrap-db.cjs.
 */

const PARTNERSHIP_JOBS = [
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

/** @param {import('mysql2/promise').Pool} pool */
async function seedPartnershipJobsIfEmpty(pool) {
  const [jobs] = await pool.query('SELECT id FROM jobs LIMIT 1');
  if (jobs.length) return false;
  await pool.query(
    `INSERT INTO jobs (title, description, location, employment_type, status)
     VALUES ?`,
    [PARTNERSHIP_JOBS.map((j) => [j[0], j[1], j[2], j[3], 'published'])]
  );
  return true;
}

module.exports = { seedPartnershipJobsIfEmpty };
