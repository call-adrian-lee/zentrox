/** Quotes — SQL access (`project_inquiries` table). */

async function insertQuote(pool, row) {
  const {
    fullName,
    email,
    company,
    phone,
    serviceType,
    requirements,
    budgetRange,
    timeline,
    source
  } = row;
  await pool.query(
    `INSERT INTO project_inquiries
      (full_name, email, company, phone, service_type, requirements, budget_range, timeline, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [fullName, email, company, phone, serviceType, requirements, budgetRange, timeline, source]
  );
}

async function listQuotesAdmin(pool) {
  const [rows] = await pool.query(
    `SELECT id, full_name, email, company, phone, service_type, requirements, budget_range,
            timeline, source, status, admin_notes, created_at, updated_at
     FROM project_inquiries
     ORDER BY created_at DESC`
  );
  return rows;
}

async function updateQuote(pool, id, fields, vals) {
  vals.push(id);
  const [result] = await pool.query(`UPDATE project_inquiries SET ${fields.join(', ')} WHERE id = ?`, vals);
  return result.affectedRows;
}

async function deleteQuote(pool, id) {
  const [result] = await pool.query('DELETE FROM project_inquiries WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = { insertQuote, listQuotesAdmin, updateQuote, deleteQuote };
