const express = require('express');
const bcrypt = require('bcryptjs');
const logger = require('../../lib/logger');
const { normalizeAdminUsername } = require('../../lib/validation');
const { signAdminToken } = require('../../auth');

/** Fixed hash so missing usernames still run bcrypt.compare (timing-safe login). */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('__zentrox_login_dummy__', 12);

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
      const u = rows[0];
      const hash = u?.password_hash || DUMMY_PASSWORD_HASH;
      const ok = u && (await bcrypt.compare(password, hash));
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
