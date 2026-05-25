const express = require('express');
const logger = require('../../lib/logger');
const { parsePositiveIntIdArray, normalizeLeadershipCtaPath } = require('../../lib/validation');
const { parsePositiveInt } = require('../../lib/route-params');
const { leadershipStaticPhotoPath, resolveLeadershipPhotoForResponse } = require('../../lib/media-paths');
const { reorderAllIds, reorderOneStep } = require('../../lib/reorder');
const leadershipService = require('../../services/leadership.service');

function createAdminLeadershipRouter({ getPool, authMiddleware }) {
  const router = express.Router();

  router.get('/admin/leadership', authMiddleware, async (_req, res) => {
    try {
      const rows = await leadershipService.listAllMembersAdmin(getPool());
      res.json({ members: rows.map(resolveLeadershipPhotoForResponse) });
    } catch (e) {
      logger.error('GET /api/admin/leadership failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/admin/leadership/reorder', authMiddleware, async (req, res) => {
    const ids = parsePositiveIntIdArray(req.body || {}, 'ids');
    if (!ids) {
      res.status(400).json({ error: 'ids must be a non-empty array of unique positive integers' });
      return;
    }
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const existing = await leadershipService.listMemberIdsOrdered(conn);
      if (existing.length !== ids.length) {
        await conn.rollback();
        res.status(400).json({ error: 'ids must list every leadership member exactly once' });
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
      await reorderAllIds(conn, 'leadership_members', ids);
      await conn.commit();
      res.json({ ok: true });
    } catch (e) {
      await conn.rollback();
      logger.error('POST /api/admin/leadership/reorder failed', e);
      res.status(500).json({ error: 'Server error' });
    } finally {
      conn.release();
    }
  });

  router.post('/admin/leadership', authMiddleware, async (req, res) => {
    const b = req.body || {};
    const name = String(b.name || '').trim().slice(0, 128);
    const roleTitle = String(b.roleTitle || '').trim().slice(0, 255);
    const blurb = String(b.blurb || '').trim();
    const badgeLabel = b.badgeLabel != null ? String(b.badgeLabel).trim().slice(0, 64) || null : null;
    const cardAria = b.cardAria != null ? String(b.cardAria).trim().slice(0, 255) || null : null;
    const ctaLabel = b.ctaLabel != null ? String(b.ctaLabel).trim().slice(0, 128) || null : null;
    const ctaAria = b.ctaAria != null ? String(b.ctaAria).trim().slice(0, 255) || null : null;
    const ctaPathNorm = normalizeLeadershipCtaPath(b.ctaPath);
    if (ctaPathNorm.error) {
      res.status(400).json({ error: ctaPathNorm.error });
      return;
    }
    const ctaPath = ctaPathNorm.value;
    const openSeat = b.openSeat === true || b.openSeat === 1 || b.openSeat === '1' ? 1 : 0;
    const status = b.status === 'published' ? 'published' : 'draft';
    if (!name || !roleTitle || !blurb) {
      res.status(400).json({ error: 'name, roleTitle, blurb required' });
      return;
    }
    try {
      const pool = getPool();
      const insertId = await leadershipService.insertMember(pool, {
        name,
        roleTitle,
        blurb,
        badgeLabel,
        cardAria,
        ctaLabel,
        ctaAria,
        ctaPath,
        openSeat,
        status
      });
      const staticPhotoPath = leadershipStaticPhotoPath(insertId);
      await leadershipService.setPhotoPath(pool, insertId, staticPhotoPath);
      res.status(201).json({ id: insertId, photoPath: staticPhotoPath });
    } catch (e) {
      logger.error('POST /api/admin/leadership failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/admin/leadership/:id', authMiddleware, async (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id == null) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const b = req.body || {};
    const name = b.name != null ? String(b.name).trim().slice(0, 128) : null;
    const roleTitle = b.roleTitle != null ? String(b.roleTitle).trim().slice(0, 255) : null;
    const blurb = b.blurb != null ? String(b.blurb).trim() : null;
    const badgeLabel =
      b.badgeLabel !== undefined ? (b.badgeLabel == null ? null : String(b.badgeLabel).trim().slice(0, 64) || null) : undefined;
    const cardAria =
      b.cardAria !== undefined ? (b.cardAria == null ? null : String(b.cardAria).trim().slice(0, 255) || null) : undefined;
    const ctaLabel =
      b.ctaLabel !== undefined ? (b.ctaLabel == null ? null : String(b.ctaLabel).trim().slice(0, 128) || null) : undefined;
    const ctaAria =
      b.ctaAria !== undefined ? (b.ctaAria == null ? null : String(b.ctaAria).trim().slice(0, 255) || null) : undefined;
    let ctaPath = undefined;
    if (b.ctaPath !== undefined) {
      const n = normalizeLeadershipCtaPath(b.ctaPath);
      if (n.error) {
        res.status(400).json({ error: n.error });
        return;
      }
      ctaPath = n.value;
    }
    let openSeat = undefined;
    if (b.openSeat !== undefined) {
      openSeat = b.openSeat === true || b.openSeat === 1 || b.openSeat === '1' ? 1 : 0;
    }
    const status = b.status != null ? (b.status === 'published' ? 'published' : 'draft') : null;
    if (name !== null && !name) {
      res.status(400).json({ error: 'Invalid name' });
      return;
    }
    if (roleTitle !== null && !roleTitle) {
      res.status(400).json({ error: 'Invalid roleTitle' });
      return;
    }
    if (blurb !== null && !blurb) {
      res.status(400).json({ error: 'Invalid blurb' });
      return;
    }
    try {
      const pool = getPool();
      if (!(await leadershipService.memberExists(pool, id))) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const staticPhotoPath = leadershipStaticPhotoPath(id);
      const fields = [];
      const vals = [];
      if (name !== null) {
        fields.push('name = ?');
        vals.push(name);
      }
      if (roleTitle !== null) {
        fields.push('role_title = ?');
        vals.push(roleTitle);
      }
      if (blurb !== null) {
        fields.push('blurb = ?');
        vals.push(blurb);
      }
      if (badgeLabel !== undefined) {
        fields.push('badge_label = ?');
        vals.push(badgeLabel);
      }
      fields.push('photo_path = ?');
      vals.push(staticPhotoPath);
      if (cardAria !== undefined) {
        fields.push('card_aria = ?');
        vals.push(cardAria);
      }
      if (ctaLabel !== undefined) {
        fields.push('cta_label = ?');
        vals.push(ctaLabel);
      }
      if (ctaAria !== undefined) {
        fields.push('cta_aria = ?');
        vals.push(ctaAria);
      }
      if (ctaPath !== undefined) {
        fields.push('cta_path = ?');
        vals.push(ctaPath);
      }
      if (openSeat !== undefined) {
        fields.push('open_seat = ?');
        vals.push(openSeat);
      }
      if (status !== null) {
        fields.push('status = ?');
        vals.push(status);
      }
      if (!fields.length) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }
      await leadershipService.updateMember(pool, id, fields, vals);
      res.json({ ok: true });
    } catch (e) {
      logger.error('PUT /api/admin/leadership/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/admin/leadership/:id/reorder', authMiddleware, async (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id == null) {
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
      const result = await reorderOneStep(conn, 'leadership_members', id, direction);
      if (!result.ok) {
        await conn.rollback();
        res.status(result.status || 400).json({ error: result.error || 'Reorder failed' });
        return;
      }
      await conn.commit();
      res.json(result);
    } catch (e) {
      await conn.rollback();
      logger.error('POST /api/admin/leadership/:id/reorder failed', e);
      res.status(500).json({ error: 'Server error' });
    } finally {
      conn.release();
    }
  });

  router.delete('/admin/leadership/:id', authMiddleware, async (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id == null) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    try {
      await leadershipService.deleteMember(getPool(), id);
      res.json({ ok: true });
    } catch (e) {
      logger.error('DELETE /api/admin/leadership/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createAdminLeadershipRouter };
