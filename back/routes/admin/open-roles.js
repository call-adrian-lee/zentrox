const express = require('express');
const logger = require('../../lib/logger');
const { parsePositiveInt } = require('../../lib/route-params');
const openRolesService = require('../../services/open-roles.service');

function createAdminOpenRolesRouter({ getPool, authMiddleware }) {
  const router = express.Router();

  router.get('/admin/open-roles', authMiddleware, async (_req, res) => {
    try {
      const roles = await openRolesService.listAllRolesAdmin(getPool());
      res.json({ roles });
    } catch (e) {
      logger.error('GET /api/admin/open-roles failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/admin/open-roles', authMiddleware, async (req, res) => {
    const { title, description, location, employmentType, status } = req.body || {};
    const t = (title || '').trim();
    const d = (description || '').trim();
    if (!t || t.length > 255) {
      res.status(400).json({ error: 'Invalid title' });
      return;
    }
    if (!d) {
      res.status(400).json({ error: 'Invalid description' });
      return;
    }
    const loc = (location != null ? String(location) : '').trim().slice(0, 255);
    const et = (employmentType != null ? String(employmentType) : 'Full-time').trim().slice(0, 64) || 'Full-time';
    const st = status === 'published' ? 'published' : 'draft';
    try {
      const id = await openRolesService.insertRole(getPool(), {
        title: t,
        description: d,
        location: loc,
        employmentType: et,
        status: st
      });
      res.status(201).json({ id });
    } catch (e) {
      logger.error('POST /api/admin/open-roles failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.put('/admin/open-roles/:id', authMiddleware, async (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id == null) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const { title, description, location, employmentType, status } = req.body || {};
    const t = title != null ? String(title).trim() : null;
    const d = description != null ? String(description).trim() : null;
    if (t !== null && (!t || t.length > 255)) {
      res.status(400).json({ error: 'Invalid title' });
      return;
    }
    if (d !== null && !d) {
      res.status(400).json({ error: 'Invalid description' });
      return;
    }
    const loc = location != null ? String(location).trim().slice(0, 255) : null;
    const et = employmentType != null ? String(employmentType).trim().slice(0, 64) : null;
    const st = status != null ? (status === 'published' ? 'published' : 'draft') : null;

    try {
      const pool = getPool();
      if (!(await openRolesService.roleExists(pool, id))) {
        res.status(404).json({ error: 'Not found' });
        return;
      }

      const fields = [];
      const vals = [];
      if (t !== null) {
        fields.push('title = ?');
        vals.push(t);
      }
      if (d !== null) {
        fields.push('description = ?');
        vals.push(d);
      }
      if (loc !== null) {
        fields.push('location = ?');
        vals.push(loc);
      }
      if (et !== null) {
        fields.push('employment_type = ?');
        vals.push(et || 'Full-time');
      }
      if (st !== null) {
        fields.push('status = ?');
        vals.push(st);
      }
      if (!fields.length) {
        res.status(400).json({ error: 'No fields to update' });
        return;
      }
      await openRolesService.updateRole(pool, id, fields, vals);
      res.json({ ok: true });
    } catch (e) {
      logger.error('PUT /api/admin/open-roles/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.delete('/admin/open-roles/:id', authMiddleware, async (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id == null) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    try {
      await openRolesService.deleteRole(getPool(), id);
      res.json({ ok: true });
    } catch (e) {
      logger.error('DELETE /api/admin/open-roles/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createAdminOpenRolesRouter };
