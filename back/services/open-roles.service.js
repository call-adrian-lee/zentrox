/** Open roles — SQL access (`jobs` / `job_applications` tables). */

async function listPublishedRoles(pool) {
  const [rows] = await pool.query(
    `SELECT id, title, description, location, employment_type, status, created_at, updated_at
     FROM jobs WHERE status = 'published' ORDER BY created_at DESC`
  );
  return rows;
}

async function getPublishedRoleById(pool, id) {
  const [rows] = await pool.query(
    `SELECT id, title, description, location, employment_type, status, created_at, updated_at
     FROM jobs WHERE id = ? AND status = 'published' LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

async function isPublishedRole(pool, roleId) {
  const [rows] = await pool.query('SELECT id FROM jobs WHERE id = ? AND status = ? LIMIT 1', [
    roleId,
    'published'
  ]);
  return rows.length > 0;
}

async function insertApplication(pool, roleId, { fullName, email, phone, coverLetter, resumeUrl }) {
  await pool.query(
    `INSERT INTO job_applications (job_id, full_name, email, phone, cover_letter, resume_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [roleId, fullName, email, phone, coverLetter, resumeUrl]
  );
}

async function listAllRolesAdmin(pool) {
  const [rows] = await pool.query(
    `SELECT id, title, description, location, employment_type, status, created_at, updated_at
     FROM jobs ORDER BY created_at DESC`
  );
  return rows;
}

async function insertRole(pool, { title, description, location, employmentType, status }) {
  const [r] = await pool.query(
    `INSERT INTO jobs (title, description, location, employment_type, status)
     VALUES (?, ?, ?, ?, ?)`,
    [title, description, location, employmentType, status]
  );
  return r.insertId;
}

async function roleExists(pool, id) {
  const [rows] = await pool.query('SELECT id FROM jobs WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0;
}

async function updateRole(pool, id, fields, vals) {
  vals.push(id);
  await pool.query(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`, vals);
}

async function deleteRole(pool, id) {
  await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
}

async function listApplications(pool, roleId) {
  let sql = `
    SELECT a.id, a.job_id AS role_id, j.title AS role_title, a.full_name, a.email, a.phone, a.cover_letter, a.resume_url, a.created_at
    FROM job_applications a
    JOIN jobs j ON j.id = a.job_id
  `;
  const params = [];
  if (roleId != null) {
    sql += ' WHERE a.job_id = ?';
    params.push(roleId);
  }
  sql += ' ORDER BY a.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function deleteApplication(pool, id) {
  const [result] = await pool.query('DELETE FROM job_applications WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  listPublishedRoles,
  getPublishedRoleById,
  isPublishedRole,
  insertApplication,
  listAllRolesAdmin,
  insertRole,
  roleExists,
  updateRole,
  deleteRole,
  listApplications,
  deleteApplication
};
