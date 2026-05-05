const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters (set in back/.env)');
  }
  return s;
}

function signAdminToken(username) {
  return jwt.sign({ sub: username, typ: 'admin' }, getJwtSecret(), { expiresIn: '7d' });
}

function verifyAdminToken(token) {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (payload.typ !== 'admin' || payload.sub == null || payload.sub === '') return null;
    return { username: String(payload.sub) };
  } catch {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }
  const session = verifyAdminToken(m[1].trim());
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  req.admin = session;
  next();
}

module.exports = { signAdminToken, verifyAdminToken, authMiddleware };
