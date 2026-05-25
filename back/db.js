const mysql = require('mysql2/promise');
const logger = require('./lib/logger');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'zentrox',
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_POOL_SIZE || 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
}

const ADMIN_USERS_DDL = `
  CREATE TABLE admin_users (
    username VARCHAR(128) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

async function ensureAdminUsersTable(connection) {
  const [[dbRow]] = await connection.query('SELECT DATABASE() AS db');
  const db = dbRow.db;
  const [tables] = await connection.query(
    'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [db, 'admin_users']
  );
  if (!tables.length) {
    await connection.query(ADMIN_USERS_DDL);
    return;
  }
  const [cols] = await connection.query('SHOW COLUMNS FROM admin_users');
  const fields = new Set(cols.map((c) => c.Field));
  if (fields.has('username') && !fields.has('email')) {
    return;
  }
  if (!fields.has('email')) {
    return;
  }
  await connection.query('DROP TABLE IF EXISTS admin_users__m_new');
  await connection.query(`
    CREATE TABLE admin_users__m_new (
      username VARCHAR(128) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      PRIMARY KEY (username)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await connection.query(`
    INSERT INTO admin_users__m_new (username, password_hash)
    SELECT LOWER(SUBSTRING_INDEX(email, '@', 1)), password_hash FROM admin_users
  `);
  await connection.query('DROP TABLE admin_users');
  await connection.query('RENAME TABLE admin_users__m_new TO admin_users');
}

async function dropIndexIfExists(connection, table, indexName) {
  const [ix] = await connection.query(`SHOW INDEX FROM \`${table}\` WHERE Key_name = ?`, [indexName]);
  if (!ix || !ix.length) return;
  try {
    await connection.query(`ALTER TABLE \`${table}\` DROP INDEX \`${indexName}\``);
  } catch (e) {
    logger.warn(`drop index ${indexName} on ${table}`, e);
  }
}

async function tableExists(connection, table) {
  const [[row]] = await connection.query(
    `SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
    [table]
  );
  return Number(row?.c) > 0;
}

/** Legacy installs: drop slug columns + unique indexes (URLs use ids only). */
async function migrateDropSlugColumns(connection) {
  const specs = [
    { table: 'leadership_members', index: 'uk_leadership_slug' },
    { table: 'portfolio_tabs', index: 'uk_portfolio_tabs_slug' },
    { table: 'portfolio_items', index: 'uk_portfolio_items_tab_slug' }
  ];
  for (const { table, index } of specs) {
    if (!(await tableExists(connection, table))) continue;
    const [cols] = await connection.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'slug'`);
    if (!cols || !cols.length) continue;
    await dropIndexIfExists(connection, table, index);
    try {
      await connection.query(`ALTER TABLE \`${table}\` DROP COLUMN slug`);
    } catch (e) {
      logger.warn(`drop slug on ${table}`, e);
    }
  }
}

async function migrateLeadershipMemberColumnComments(connection) {
  if (!(await tableExists(connection, 'leadership_members'))) return;
  try {
    await connection.query(`
      ALTER TABLE leadership_members
        MODIFY COLUMN name VARCHAR(128) NOT NULL COMMENT 'Display name (person or open-seat label)',
        MODIFY COLUMN role_title VARCHAR(255) NOT NULL COMMENT 'Role line under the name',
        MODIFY COLUMN photo_path VARCHAR(512) NULL COMMENT 'Stored token leadership-{id}; app maps to /img/leadership/leadership-{id}.png'
    `);
  } catch (e) {
    logger.warn('leadership_members column comments', e);
  }
}

async function ensureLeadershipMemberColumns(connection) {
  for (let i = 0; i < 5; i += 1) {
    const [cols] = await connection.query('SHOW COLUMNS FROM leadership_members');
    const fields = new Set(cols.map((c) => c.Field));
    if (fields.has('cta_label') && fields.has('cta_aria') && fields.has('cta_path')) return;
    if (!fields.has('cta_label')) {
      await connection.query(
        'ALTER TABLE leadership_members ADD COLUMN cta_label VARCHAR(128) NULL AFTER card_aria'
      );
    } else if (!fields.has('cta_aria')) {
      await connection.query(
        'ALTER TABLE leadership_members ADD COLUMN cta_aria VARCHAR(255) NULL AFTER cta_label'
      );
    } else if (!fields.has('cta_path')) {
      await connection.query(
        'ALTER TABLE leadership_members ADD COLUMN cta_path VARCHAR(512) NULL AFTER cta_aria'
      );
    }
  }
}

async function ensureSchema(connection) {
  await ensureAdminUsersTable(connection);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      location VARCHAR(255) NOT NULL DEFAULT '',
      employment_type VARCHAR(64) NOT NULL DEFAULT 'Full-time',
      status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_jobs_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      job_id INT UNSIGNED NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(64) NULL,
      cover_letter TEXT NULL,
      resume_url VARCHAR(1024) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY idx_job_applications_job_id (job_id),
      KEY idx_job_applications_created (created_at),
      CONSTRAINT fk_job_applications_job FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS leadership_members (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(128) NOT NULL COMMENT 'Display name (person or open-seat label)',
      role_title VARCHAR(255) NOT NULL COMMENT 'Role line under the name',
      blurb TEXT NOT NULL,
      badge_label VARCHAR(64) NULL,
      photo_path VARCHAR(512) NULL COMMENT 'Stored token leadership-{id}; app maps to /img/leadership/leadership-{id}.png',
      card_aria VARCHAR(255) NULL,
      cta_label VARCHAR(128) NULL,
      cta_aria VARCHAR(255) NULL,
      cta_path VARCHAR(512) NULL,
      open_seat TINYINT(1) NOT NULL DEFAULT 0,
      sort_order INT NOT NULL DEFAULT 0,
      status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_leadership_status_sort (status, sort_order, id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await migrateDropSlugColumns(connection);
  await ensureLeadershipMemberColumns(connection);
  await migrateLeadershipMemberColumnComments(connection);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS portfolio_tabs (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(128) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_portfolio_tabs_status_sort (status, sort_order, id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS project_inquiries (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      company VARCHAR(255) NULL,
      phone VARCHAR(64) NULL,
      service_type VARCHAR(64) NOT NULL,
      requirements TEXT NOT NULL,
      budget_range VARCHAR(64) NOT NULL,
      timeline VARCHAR(64) NULL,
      source VARCHAR(64) NULL,
      status ENUM('new', 'contacted', 'qualified', 'won', 'lost') NOT NULL DEFAULT 'new',
      admin_notes TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_project_inquiries_status (status),
      KEY idx_project_inquiries_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      tab_id INT UNSIGNED NOT NULL,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255) NULL,
      description TEXT NOT NULL,
      image_path VARCHAR(512) NOT NULL,
      link_url VARCHAR(1024) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_portfolio_items_tab (tab_id, status, sort_order),
      CONSTRAINT fk_portfolio_items_tab FOREIGN KEY (tab_id) REFERENCES portfolio_tabs (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

module.exports = { getPool, ensureSchema };
