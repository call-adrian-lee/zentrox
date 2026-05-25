const path = require('path');
const express = require('express');
const sharp = require('sharp');
const logger = require('../../lib/logger');
const { parsePositiveIntIdArray, normalizeRequiredHttpUrl } = require('../../lib/validation');
const {
  portfolioStaticImagePath,
  portfolioExpectedPublicImagePath,
  resolvePortfolioImageForResponse
} = require('../../lib/media-paths');
const {
  PORTFOLIO_IMAGE_MAX_WIDTH,
  PORTFOLIO_IMAGE_MAX_HEIGHT,
  ensurePortfolioImageUploadDir,
  portfolioImageMemoryUpload
} = require('../../lib/portfolio-upload');
const { reorderAllIds, reorderOneStep } = require('../../lib/reorder');

function createAdminPortfolioRouter({ getPool, authMiddleware }) {
  const router = express.Router();

  router.post('/admin/portfolio/image', authMiddleware, (req, res, next) => {
    portfolioImageMemoryUpload.single('photo')(req, res, (err) => {
      if (err) {
        const code = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        const msg =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Image too large (max 15 MB before processing)'
            : err.message || 'Upload failed';
        res.status(code).json({ error: msg });
        return;
      }
      next();
    });
  }, async (req, res) => {
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: 'photo file is required' });
      return;
    }
    const rawId = req.body?.itemId;
    const itemId = rawId != null && String(rawId).trim() !== '' ? Number(rawId) : NaN;
    if (!Number.isInteger(itemId) || itemId < 1) {
      res.status(400).json({ error: 'itemId is required (save the portfolio item first)' });
      return;
    }
    try {
      const pool = getPool();
      const [rows] = await pool.query('SELECT id FROM portfolio_items WHERE id = ? LIMIT 1', [itemId]);
      if (!rows.length) {
        res.status(404).json({ error: 'Portfolio item not found' });
        return;
      }
    } catch (e) {
      logger.error('POST /api/admin/portfolio/image lookup failed', e);
      res.status(500).json({ error: 'Server error' });
      return;
    }
    const dir = ensurePortfolioImageUploadDir();
    const filename = `portfolio-${itemId}.png`;
    const fsPath = path.join(dir, filename);
    try {
      await sharp(req.file.buffer)
        .rotate()
        .resize(PORTFOLIO_IMAGE_MAX_WIDTH, PORTFOLIO_IMAGE_MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({ compressionLevel: 8 })
        .toFile(fsPath);
    } catch (e) {
      logger.error('POST /api/admin/portfolio/image processing failed', e);
      res.status(400).json({ error: 'Could not process image (try another file)' });
      return;
    }
    res.json({ imagePath: portfolioExpectedPublicImagePath(itemId) });
  });

  router.get('/admin/portfolio/tabs', authMiddleware, async (_req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT id, title, sort_order, status, created_at, updated_at FROM portfolio_tabs ORDER BY sort_order ASC, id ASC`
      );
      res.json({ tabs: rows });
    } catch (e) {
      logger.error('GET /api/admin/portfolio/tabs failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/admin/portfolio/tabs/reorder', authMiddleware, async (req, res) => {
    const ids = parsePositiveIntIdArray(req.body || {}, 'ids');
    if (!ids) {
      res.status(400).json({ error: 'ids must be a non-empty array of unique positive integers' });
      return;
    }
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.query('SELECT id FROM portfolio_tabs ORDER BY sort_order ASC, id ASC');
      const existing = rows.map((r) => r.id);
      if (existing.length !== ids.length) {
        await conn.rollback();
        res.status(400).json({ error: 'ids must list every portfolio tab exactly once' });
        return;
      }
      const setE = new Set(existing);
      for (const id of ids) {
        if (!setE.has(id)) {
          await conn.rollback();
          res.status(400).json({ error: 'invalid id in ids' });
          return;
        }
      }
      await reorderAllIds(conn, 'portfolio_tabs', ids);
      await conn.commit();
      res.json({ ok: true });
    } catch (e) {
      await conn.rollback();
      logger.error('POST /api/admin/portfolio/tabs/reorder failed', e);
      res.status(500).json({ error: 'Server error' });
    } finally {
      conn.release();
    }
  });

  router.post('/admin/portfolio/tabs', authMiddleware, async (req, res) => {
    const b = req.body || {};
    const title = String(b.title || '').trim().slice(0, 128);
    const status = b.status === 'published' ? 'published' : 'draft';
    if (!title) {
      res.status(400).json({ error: 'title required' });
      return;
    }
    try {
      const pool = getPool();
      const [ordRows] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) AS m FROM portfolio_tabs');
      const sortOrder = Number(ordRows[0]?.m ?? -1) + 1;
      const [r] = await pool.query(`INSERT INTO portfolio_tabs (title, sort_order, status) VALUES (?, ?, ?)`, [
        title,
        sortOrder,
        status
      ]);
      res.status(201).json({ id: r.insertId });
    } catch (e) {
      logger.error('POST /api/admin/portfolio/tabs failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/admin/portfolio/tabs/:id', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const b = req.body || {};
    const title = b.title != null ? String(b.title).trim().slice(0, 128) : null;
    const status = b.status != null ? (b.status === 'published' ? 'published' : 'draft') : null;
    if (title !== null && !title) {
      res.status(400).json({ error: 'Invalid title' });
      return;
    }
    try {
      const pool = getPool();
      const [cur] = await pool.query('SELECT id FROM portfolio_tabs WHERE id = ?', [id]);
      if (!cur.length) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const fields = [];
      const vals = [];
      if (title !== null) {
        fields.push('title = ?');
        vals.push(title);
      }
      if (status !== null) {
        fields.push('status = ?');
        vals.push(status);
      }
      if (!fields.length) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }
      vals.push(id);
      await pool.query(`UPDATE portfolio_tabs SET ${fields.join(', ')} WHERE id = ?`, vals);
      res.json({ ok: true });
    } catch (e) {
      logger.error('PUT /api/admin/portfolio/tabs/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/admin/portfolio/tabs/:id/reorder', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const direction = String((req.body || {}).direction || '').toLowerCase();
    if (direction !== 'up' && direction !== 'down') {
      res.status(400).json({ error: 'direction must be up or down' });
      return;
    }
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const result = await reorderOneStep(conn, 'portfolio_tabs', id, direction);
      if (!result.ok) {
        await conn.rollback();
        res.status(result.status || 400).json({ error: result.error || 'Reorder failed' });
        return;
      }
      await conn.commit();
      res.json(result);
    } catch (e) {
      await conn.rollback();
      logger.error('POST /api/admin/portfolio/tabs/:id/reorder failed', e);
      res.status(500).json({ error: 'Server error' });
    } finally {
      conn.release();
    }
  });

  router.delete('/admin/portfolio/tabs/:id', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    try {
      const pool = getPool();
      await pool.query('DELETE FROM portfolio_tabs WHERE id = ?', [id]);
      res.json({ ok: true });
    } catch (e) {
      logger.error('DELETE /api/admin/portfolio/tabs/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/admin/portfolio/items', authMiddleware, async (_req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT pi.id, pi.tab_id, pt.title AS tab_title, pi.title, pi.subtitle, pi.problem, pi.outcome, pi.description, pi.image_path, pi.link_url, pi.sort_order, pi.status, pi.created_at, pi.updated_at
         FROM portfolio_items pi
         INNER JOIN portfolio_tabs pt ON pt.id = pi.tab_id
         ORDER BY pt.sort_order ASC, pi.sort_order ASC, pi.id ASC`
      );
      res.json({ items: rows.map(resolvePortfolioImageForResponse) });
    } catch (e) {
      logger.error('GET /api/admin/portfolio/items failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/admin/portfolio/items/reorder', authMiddleware, async (req, res) => {
    const b = req.body || {};
    const tabId = Number(b.tabId);
    if (!Number.isInteger(tabId) || tabId < 1) {
      res.status(400).json({ error: 'tabId must be a positive integer' });
      return;
    }
    const ids = parsePositiveIntIdArray(b, 'ids');
    if (!ids) {
      res.status(400).json({ error: 'ids must be a non-empty array of unique positive integers' });
      return;
    }
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [tabCheck] = await conn.query('SELECT id FROM portfolio_tabs WHERE id = ? LIMIT 1', [tabId]);
      if (!tabCheck.length) {
        await conn.rollback();
        res.status(404).json({ error: 'Tab not found' });
        return;
      }
      const [rows] = await conn.query(
        'SELECT id FROM portfolio_items WHERE tab_id = ? ORDER BY sort_order ASC, id ASC',
        [tabId]
      );
      const existing = rows.map((r) => r.id);
      if (existing.length !== ids.length) {
        await conn.rollback();
        res.status(400).json({ error: 'ids must list every item in this tab exactly once' });
        return;
      }
      const setE = new Set(existing);
      for (const id of ids) {
        if (!setE.has(id)) {
          await conn.rollback();
          res.status(400).json({ error: 'invalid id in ids for this tab' });
          return;
        }
      }
      for (let i = 0; i < ids.length; i += 1) {
        await conn.query('UPDATE portfolio_items SET sort_order = ? WHERE id = ? AND tab_id = ?', [i, ids[i], tabId]);
      }
      await conn.commit();
      res.json({ ok: true });
    } catch (e) {
      await conn.rollback();
      logger.error('POST /api/admin/portfolio/items/reorder failed', e);
      res.status(500).json({ error: 'Server error' });
    } finally {
      conn.release();
    }
  });

  router.post('/admin/portfolio/items', authMiddleware, async (req, res) => {
    const b = req.body || {};
    const tabId = Number(b.tabId);
    const title = String(b.title || '').trim().slice(0, 255);
    const subtitle = b.subtitle != null ? String(b.subtitle).trim().slice(0, 255) || null : null;
    const problem = b.problem != null ? String(b.problem).trim().slice(0, 512) || null : null;
    const outcome = b.outcome != null ? String(b.outcome).trim().slice(0, 512) || null : null;
    const description = String(b.description || '').trim();
    const linkNorm = normalizeRequiredHttpUrl(b.linkUrl);
    const status = b.status === 'published' ? 'published' : 'draft';
    if (!Number.isInteger(tabId) || tabId < 1 || !title || !description) {
      res.status(400).json({ error: 'tabId, title, description, linkUrl required' });
      return;
    }
    if (linkNorm.error) {
      res.status(400).json({ error: linkNorm.error });
      return;
    }
    const linkUrl = linkNorm.value;
    try {
      const pool = getPool();
      const [tab] = await pool.query('SELECT id FROM portfolio_tabs WHERE id = ? LIMIT 1', [tabId]);
      if (!tab.length) {
        res.status(400).json({ error: 'Invalid tabId' });
        return;
      }
      const [ordRows] = await pool.query(
        'SELECT COALESCE(MAX(sort_order), -1) AS m FROM portfolio_items WHERE tab_id = ?',
        [tabId]
      );
      const sortOrder = Number(ordRows[0]?.m ?? -1) + 1;
      const [r] = await pool.query(
        `INSERT INTO portfolio_items (tab_id, title, subtitle, problem, outcome, description, image_path, link_url, sort_order, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [tabId, title, subtitle, problem, outcome, description, '', linkUrl, sortOrder, status]
      );
      const staticImagePath = portfolioStaticImagePath(r.insertId);
      await pool.query('UPDATE portfolio_items SET image_path = ? WHERE id = ?', [staticImagePath, r.insertId]);
      res.status(201).json({ id: r.insertId, imagePath: staticImagePath });
    } catch (e) {
      logger.error('POST /api/admin/portfolio/items failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/admin/portfolio/items/:id', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const b = req.body || {};
    const tabId = b.tabId != null ? Number(b.tabId) : null;
    const title = b.title != null ? String(b.title).trim().slice(0, 255) : null;
    const subtitle =
      b.subtitle !== undefined ? (b.subtitle == null ? null : String(b.subtitle).trim().slice(0, 255) || null) : undefined;
    const problem =
      b.problem !== undefined ? (b.problem == null ? null : String(b.problem).trim().slice(0, 512) || null) : undefined;
    const outcome =
      b.outcome !== undefined ? (b.outcome == null ? null : String(b.outcome).trim().slice(0, 512) || null) : undefined;
    const description = b.description != null ? String(b.description).trim() : null;
    const linkUrlRaw = b.linkUrl != null ? String(b.linkUrl).trim() : null;
    const status = b.status != null ? (b.status === 'published' ? 'published' : 'draft') : null;
    if (title !== null && !title) {
      res.status(400).json({ error: 'Invalid title' });
      return;
    }
    if (description !== null && !description) {
      res.status(400).json({ error: 'Invalid description' });
      return;
    }
    if (linkUrlRaw !== null && !linkUrlRaw) {
      res.status(400).json({ error: 'Invalid linkUrl' });
      return;
    }
    let linkUrl = null;
    if (linkUrlRaw !== null) {
      const linkNorm = normalizeRequiredHttpUrl(linkUrlRaw);
      if (linkNorm.error) {
        res.status(400).json({ error: linkNorm.error });
        return;
      }
      linkUrl = linkNorm.value;
    }
    if (tabId !== null && (!Number.isInteger(tabId) || tabId < 1)) {
      res.status(400).json({ error: 'Invalid tabId' });
      return;
    }
    try {
      const pool = getPool();
      const [curRows] = await pool.query('SELECT id, tab_id, title FROM portfolio_items WHERE id = ?', [id]);
      if (!curRows.length) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const prevTabId = curRows[0].tab_id;
      if (tabId !== null) {
        const [tab] = await pool.query('SELECT id FROM portfolio_tabs WHERE id = ? LIMIT 1', [tabId]);
        if (!tab.length) {
          res.status(400).json({ error: 'Invalid tabId' });
          return;
        }
      }
      let sortOrderOnTabMove = null;
      if (tabId !== null && tabId !== prevTabId) {
        const [ordRows] = await pool.query(
          'SELECT COALESCE(MAX(sort_order), -1) AS m FROM portfolio_items WHERE tab_id = ?',
          [tabId]
        );
        sortOrderOnTabMove = Number(ordRows[0]?.m ?? -1) + 1;
      }
      const fields = [];
      const vals = [];
      if (tabId !== null) {
        fields.push('tab_id = ?');
        vals.push(tabId);
      }
      if (sortOrderOnTabMove !== null) {
        fields.push('sort_order = ?');
        vals.push(sortOrderOnTabMove);
      }
      if (title !== null) {
        fields.push('title = ?');
        vals.push(title);
      }
      if (subtitle !== undefined) {
        fields.push('subtitle = ?');
        vals.push(subtitle);
      }
      if (problem !== undefined) {
        fields.push('problem = ?');
        vals.push(problem);
      }
      if (outcome !== undefined) {
        fields.push('outcome = ?');
        vals.push(outcome);
      }
      if (description !== null) {
        fields.push('description = ?');
        vals.push(description);
      }
      fields.push('image_path = ?');
      vals.push(portfolioStaticImagePath(id));
      if (linkUrl !== null) {
        fields.push('link_url = ?');
        vals.push(linkUrl);
      }
      if (status !== null) {
        fields.push('status = ?');
        vals.push(status);
      }
      if (!fields.length) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }
      vals.push(id);
      await pool.query(`UPDATE portfolio_items SET ${fields.join(', ')} WHERE id = ?`, vals);
      res.json({ ok: true });
    } catch (e) {
      logger.error('PUT /api/admin/portfolio/items/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/admin/portfolio/items/:id/reorder', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const direction = String((req.body || {}).direction || '').toLowerCase();
    if (direction !== 'up' && direction !== 'down') {
      res.status(400).json({ error: 'direction must be up or down' });
      return;
    }
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [tabPick] = await conn.query('SELECT tab_id FROM portfolio_items WHERE id = ? LIMIT 1', [id]);
      if (!tabPick.length) {
        await conn.rollback();
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const tabId = tabPick[0].tab_id;
      const [rows] = await conn.query(
        `SELECT id FROM portfolio_items WHERE tab_id = ? ORDER BY sort_order ASC, id ASC`,
        [tabId]
      );
      const ids = rows.map((r) => r.id);
      const idx = ids.indexOf(id);
      if (idx === -1) {
        await conn.rollback();
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const j = direction === 'up' ? idx - 1 : idx + 1;
      if (j < 0 || j >= ids.length) {
        await conn.rollback();
        res.json({ ok: true, unchanged: true });
        return;
      }
      const newOrder = [...ids];
      [newOrder[idx], newOrder[j]] = [newOrder[j], newOrder[idx]];
      for (let k = 0; k < newOrder.length; k += 1) {
        await conn.query('UPDATE portfolio_items SET sort_order = ? WHERE id = ?', [k, newOrder[k]]);
      }
      await conn.commit();
      res.json({ ok: true });
    } catch (e) {
      await conn.rollback();
      logger.error('POST /api/admin/portfolio/items/:id/reorder failed', e);
      res.status(500).json({ error: 'Server error' });
    } finally {
      conn.release();
    }
  });

  router.delete('/admin/portfolio/items/:id', authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    try {
      const pool = getPool();
      await pool.query('DELETE FROM portfolio_items WHERE id = ?', [id]);
      res.json({ ok: true });
    } catch (e) {
      logger.error('DELETE /api/admin/portfolio/items/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createAdminPortfolioRouter };
