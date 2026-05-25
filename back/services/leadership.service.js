/** Leadership members — SQL access (`leadership_members` table). */

const PUBLISHED_SELECT = `id, name, role_title, blurb, photo_path, sort_order`;
const ADMIN_SELECT = `id, name, role_title, blurb, badge_label, photo_path, card_aria, cta_label, cta_aria, cta_path, open_seat, sort_order, status, created_at, updated_at`;

async function listPublishedMembers(pool) {
  const [rows] = await pool.query(
    `SELECT ${PUBLISHED_SELECT}
     FROM leadership_members WHERE status = 'published' ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function listAllMembersAdmin(pool) {
  const [rows] = await pool.query(
    `SELECT ${ADMIN_SELECT} FROM leadership_members ORDER BY sort_order ASC, id ASC`
  );
  return rows;
}

async function listMemberIdsOrdered(conn) {
  const [rows] = await conn.query('SELECT id FROM leadership_members ORDER BY sort_order ASC, id ASC');
  return rows.map((r) => r.id);
}

async function nextSortOrder(pool) {
  const [ordRows] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) AS m FROM leadership_members');
  return Number(ordRows[0]?.m ?? -1) + 1;
}

async function insertMember(pool, row) {
  const sortOrder = await nextSortOrder(pool);
  const [r] = await pool.query(
    `INSERT INTO leadership_members (name, role_title, blurb, badge_label, photo_path, card_aria, cta_label, cta_aria, cta_path, open_seat, sort_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.name,
      row.roleTitle,
      row.blurb,
      row.badgeLabel,
      null,
      row.cardAria,
      row.ctaLabel,
      row.ctaAria,
      row.ctaPath,
      row.openSeat,
      sortOrder,
      row.status
    ]
  );
  return r.insertId;
}

async function memberExists(pool, id) {
  const [rows] = await pool.query('SELECT id FROM leadership_members WHERE id = ? LIMIT 1', [id]);
  return rows.length > 0;
}

async function setPhotoPath(pool, id, photoPath) {
  await pool.query('UPDATE leadership_members SET photo_path = ? WHERE id = ?', [photoPath, id]);
}

async function updateMember(pool, id, fields, vals) {
  vals.push(id);
  await pool.query(`UPDATE leadership_members SET ${fields.join(', ')} WHERE id = ?`, vals);
}

async function deleteMember(pool, id) {
  await pool.query('DELETE FROM leadership_members WHERE id = ?', [id]);
}

module.exports = {
  listPublishedMembers,
  listAllMembersAdmin,
  listMemberIdsOrdered,
  insertMember,
  memberExists,
  setPhotoPath,
  updateMember,
  deleteMember
};
