const express = require('express');
const logger = require('../../lib/logger');
const { parsePositiveInt } = require('../../lib/route-params');
const { normalizeOptionalResumeUrl, isValidEmail } = require('../../lib/validation');
const openRolesService = require('../../services/open-roles.service');

function createUserOpenRolesRouter({ getPool, applicationRateLimit }) {
  const router = express.Router();

  router.get('/open-roles', async (_req, res) => {
    try {
      const roles = await openRolesService.listPublishedRoles(getPool());
      res.json({ roles });
    } catch (e) {
      logger.error('GET /api/open-roles failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/open-roles/:id', async (req, res) => {
    const id = parsePositiveInt(req.params.id);
    if (id == null) {
      res.status(400).json({ error: 'Invalid role id' });
      return;
    }
    try {
      const role = await openRolesService.getPublishedRoleById(getPool(), id);
      if (!role) {
        res.status(404).json({ error: 'Open role not found' });
        return;
      }
      res.json({ role });
    } catch (e) {
      logger.error('GET /api/open-roles/:id failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.post('/open-roles/:id/applications', applicationRateLimit, async (req, res) => {
    const roleId = parsePositiveInt(req.params.id);
    if (roleId == null) {
      res.status(400).json({ error: 'Invalid role id' });
      return;
    }
    const { fullName, email, phone, coverLetter, resumeUrl } = req.body || {};
    const name = (fullName || '').trim();
    const em = (email || '').trim();
    if (name.length < 2 || name.length > 255) {
      res.status(400).json({ error: 'Invalid fullName' });
      return;
    }
    if (!isValidEmail(em)) {
      res.status(400).json({ error: 'Invalid email' });
      return;
    }
    const phoneT = phone != null ? String(phone).trim().slice(0, 64) : null;
    const cover = coverLetter != null ? String(coverLetter).trim().slice(0, 20000) : null;
    const resumeNorm = normalizeOptionalResumeUrl(resumeUrl);
    if (resumeNorm.error) {
      res.status(400).json({ error: resumeNorm.error });
      return;
    }

    try {
      const pool = getPool();
      if (!(await openRolesService.isPublishedRole(pool, roleId))) {
        res.status(404).json({ error: 'Open role not open for applications' });
        return;
      }
      await openRolesService.insertApplication(pool, roleId, {
        fullName: name,
        email: em,
        phone: phoneT || null,
        coverLetter: cover || null,
        resumeUrl: resumeNorm.value || null
      });
      res.status(201).json({ ok: true });
    } catch (e) {
      logger.error('POST /api/open-roles/:id/applications failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createUserOpenRolesRouter };
