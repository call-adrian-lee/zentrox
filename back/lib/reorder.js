/** Transaction-safe full-list reorder (drag-sort id lists). */
async function reorderAllIds(conn, table, ids) {
  for (let i = 0; i < ids.length; i += 1) {
    await conn.query(`UPDATE \`${table}\` SET sort_order = ? WHERE id = ?`, [i, ids[i]]);
  }
}

/** Swap one row up/down within ordered list. */
async function reorderOneStep(conn, table, id, direction) {
  const [rows] = await conn.query(`SELECT id FROM \`${table}\` ORDER BY sort_order ASC, id ASC`);
  const ids = rows.map((r) => r.id);
  const idx = ids.indexOf(id);
  if (idx === -1) return { ok: false, status: 404, error: 'Not found' };
  const j = direction === 'up' ? idx - 1 : idx + 1;
  if (j < 0 || j >= ids.length) return { ok: true, unchanged: true };
  const newOrder = [...ids];
  [newOrder[idx], newOrder[j]] = [newOrder[j], newOrder[idx]];
  await reorderAllIds(conn, table, newOrder);
  return { ok: true };
}

module.exports = { reorderAllIds, reorderOneStep };
