const express = require('express');
const logger = require('../../lib/logger');
const { parsePositiveInt } = require('../../lib/route-params');
const openRolesService = require('../../services/open-roles.service');

function createAdminApplicationsRouter({ getPool, authMiddleware }) {
  const router = express.Router();

  router.get('/admin/open-role-applications', authMiddleware, async (req, res) => {
    const roleId = req.query.roleId != null ? parsePositiveInt(req.query.roleId) : null;
    if (req.query.roleId != null && roleId == null) {
      res.status(400).json({ error: 'Invalid roleId' });
      return;
    }
    try {
      const applications = await openRolesService.listApplications(getPool(), roleId);
      res.json({ applications });
    } catch (e) {
      logger.error('GET /api/admin/open-role-applications failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.delete('/admin/open-role-applications/:id', authMiddleware, async (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id == null) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    try {
      const affected = await openRolesService.deleteApplication(getPool(), id);
      if (affected === 0) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json({ ok: true });
    } catch (e) {
      logger.error('DELETE /api/admin/open-role-applications/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createAdminApplicationsRouter };
