const express = require('express');
const bcrypt = require('bcryptjs');
const logger = require('../../lib/logger');
const { normalizeAdminUsername } = require('../../lib/validation');
const { signAdminToken } = require('../../auth');

function createAdminAuthRouter({ getPool, authRateLimit }) {
  const router = express.Router();

  router.post('/admin/login', authRateLimit, async (req, res) => {
    const username = normalizeAdminUsername(req.body?.username ?? req.body?.email ?? '');
    const password = req.body?.password || '';
    if (!username || !password) {
      res.status(400).json({ error: 'username and password required' });
      return;
    }
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT username, password_hash FROM admin_users WHERE username = ? LIMIT 1',
        [username]
      );
      if (!rows.length) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      const u = rows[0];
      const ok = await bcrypt.compare(password, u.password_hash);
      if (!ok) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      const token = signAdminToken(u.username);
      res.json({ token, username: u.username });
    } catch (e) {
      logger.error('POST /api/admin/login failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createAdminAuthRouter };
