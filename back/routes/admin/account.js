const express = require('express');
const bcrypt = require('bcryptjs');
const logger = require('../../lib/logger');
const { validateAdminUsername } = require('../../lib/validation');
const { signAdminToken } = require('../../auth');

function createAdminAccountRouter({ getPool, authMiddleware }) {
  const router = express.Router();

  router.get('/admin/account', authMiddleware, async (req, res) => {
    res.json({ username: req.admin.username });
  });

  router.put('/admin/account', authMiddleware, async (req, res) => {
    const currentPassword = req.body?.currentPassword || '';
    const newUsernameRaw = req.body?.newUsername;
    const newPassword = String(req.body?.newPassword || '');
    const confirmPassword = String(req.body?.confirmPassword || '');

    if (!currentPassword) {
      res.status(400).json({ error: 'currentPassword required' });
      return;
    }

    const changingUsername = newUsernameRaw != null && String(newUsernameRaw).trim() !== '';
    const changingPassword = newPassword.length > 0;

    if (!changingUsername && !changingPassword) {
      res.status(400).json({ error: 'Provide newUsername and/or newPassword' });
      return;
    }

    if (changingPassword) {
      if (newPassword.length < 8) {
        res.status(400).json({ error: 'newPassword must be at least 8 characters' });
        return;
      }
      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: 'newPassword and confirmPassword do not match' });
        return;
      }
    }

    let newUsername = null;
    if (changingUsername) {
      const parsed = validateAdminUsername(newUsernameRaw);
      if (parsed.error) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      newUsername = parsed.username;
      if (newUsername === req.admin.username && !changingPassword) {
        res.status(400).json({ error: 'Nothing to change' });
        return;
      }
    }

    try {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT username, password_hash FROM admin_users WHERE username = ? LIMIT 1',
        [req.admin.username]
      );
      if (!rows.length) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      const row = rows[0];
      const ok = await bcrypt.compare(currentPassword, row.password_hash);
      if (!ok) {
        res.status(400).json({ error: 'Invalid current password' });
        return;
      }

      const finalUsername = newUsername || row.username;
      if (newUsername && newUsername !== row.username) {
        const [existing] = await pool.query('SELECT username FROM admin_users WHERE username = ? LIMIT 1', [
          newUsername
        ]);
        if (existing.length) {
          res.status(409).json({ error: 'username already taken' });
          return;
        }
      }

      const passwordHash = changingPassword ? await bcrypt.hash(newPassword, 12) : row.password_hash;

      if (newUsername && newUsername !== row.username) {
        await pool.query('UPDATE admin_users SET username = ?, password_hash = ? WHERE username = ?', [
          finalUsername,
          passwordHash,
          row.username
        ]);
      } else if (changingPassword) {
        await pool.query('UPDATE admin_users SET password_hash = ? WHERE username = ?', [
          passwordHash,
          row.username
        ]);
      }

      const token = signAdminToken(finalUsername);
      res.json({ username: finalUsername, token });
    } catch (e) {
      logger.error('PUT /api/admin/account failed', e);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

module.exports = { createAdminAccountRouter };
