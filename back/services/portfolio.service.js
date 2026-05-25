/** Portfolio tabs/items — SQL access (`portfolio_tabs`, `portfolio_items` tables). */

async function listPublishedPortfolio(pool) {
  const [tabs] = await pool.query(
    `SELECT id, title, sort_order FROM portfolio_tabs WHERE status = 'published' ORDER BY sort_order ASC, id ASC`
  );
  const [items] = await pool.query(
    `SELECT pi.id, pi.tab_id, pi.title, pi.subtitle, pi.problem, pi.outcome, pi.description, pi.image_path, pi.link_url, pi.sort_order
     FROM portfolio_items pi
     INNER JOIN portfolio_tabs pt ON pt.id = pi.tab_id AND pt.status = 'published'
     WHERE pi.status = 'published'
     ORDER BY pt.sort_order ASC, pi.sort_order ASC, pi.id ASC`
  );
  return { tabs, items };
}

module.exports = { listPublishedPortfolio };
