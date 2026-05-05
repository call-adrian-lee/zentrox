require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const { getPool, ensureSchema } = require('./db');
const { seedCanonicalHomepageContent } = require('./seed-canonical.cjs');
const { signAdminToken, authMiddleware } = require('./auth');

const jwtSecret = String(process.env.JWT_SECRET || '');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters and set in back/.env');
}

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.disable('x-powered-by');
app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const allow = [
        'http://127.0.0.1:4200',
        'http://localhost:4200',
        /^https:\/\/zentrox\.us$/i,
        /^http:\/\/127\.0\.0\.1:\d+$/,
        /^http:\/\/localhost:\d+$/
      ];
      if (allow.some((a) => (typeof a === 'string' ? a === origin : a.test(origin)))) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

const commonRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX || 400),
  standardHeaders: 'draft-7',
  legacyHeaders: false
});
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT_MAX || 8),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts, try again later' }
});
const applicationRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: Number(process.env.APPLICATION_RATE_LIMIT_MAX || 20),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many submissions, try again later' }
});
app.use('/api', commonRateLimit);

const ADMIN_IMAGE_UPLOAD_MIMES = {
  'image/jpeg': true,
  'image/jpg': true,
  'image/png': true,
  'image/webp': true,
  'image/gif': true
};

const ADMIN_IMAGE_UPLOAD_EXTS = {
  '.jpg': true,
  '.jpeg': true,
  '.png': true,
  '.webp': true,
  '.gif': true
};

function isAllowedAdminImageUpload(file) {
  const mime = String(file?.mimetype || '').toLowerCase().trim();
  const ext = path.extname(String(file?.originalname || '')).toLowerCase();
  if (ADMIN_IMAGE_UPLOAD_MIMES[mime]) return true;
  if (!mime || mime === 'application/octet-stream') {
    return !!ADMIN_IMAGE_UPLOAD_EXTS[ext];
  }
  return false;
}

const PORTFOLIO_IMAGE_MAX_WIDTH = 1200;
const PORTFOLIO_IMAGE_MAX_HEIGHT = 800;

function portfolioImageUploadDir() {
  if (process.env.PORTFOLIO_UPLOAD_DIR) {
    return path.resolve(process.env.PORTFOLIO_UPLOAD_DIR);
  }
  return path.join(__dirname, '..', 'front', 'img', 'portfolio');
}

function ensurePortfolioImageUploadDir() {
  const dir = portfolioImageUploadDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const portfolioImageMemoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (isAllowedAdminImageUpload(file)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  }
});

const MVP_STAGES = [
  'Discovery',
  'Research & planning',
  'Design',
  'Prototyping',
  'Development',
  'Integration',
  'Alpha',
  'Beta',
  'Pilot',
  'Production',
  'Maintenance',
  'Paused',
  'Sunset'
];

function normalizeMvpStage(raw, { required } = { required: true }) {
  const t = raw != null ? String(raw).trim().slice(0, 64) : '';
  if (!t) {
    if (required) return { error: 'stage is required' };
    return { value: null };
  }
  if (!MVP_STAGES.includes(t)) {
    return { error: 'stage must be one of the allowed values' };
  }
  return { value: t };
}

/** `body[key]`: non-empty array of unique positive integers (e.g. drag-sort id lists). */
function parsePositiveIntIdArray(body, key = 'ids') {
  const raw = body && body[key];
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out = [];
  for (const x of raw) {
    const n = Number(x);
    if (!Number.isInteger(n) || n < 1) return null;
    out.push(n);
  }
  if (new Set(out).size !== out.length) return null;
  return out;
}

function normalizeAdminUsername(raw) {
  return String(raw || '').trim().toLowerCase();
}

/** Non-empty optional résumé link: must parse as http(s) URL. */
function normalizeOptionalResumeUrl(raw) {
  if (raw == null) return { value: null };
  const t = String(raw).trim();
  if (!t) return { value: null };
  const s = t.slice(0, 1024);
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { error: 'resumeUrl must use http or https' };
    }
    return { value: s };
  } catch {
    return { error: 'Invalid resumeUrl' };
  }
}

/** In-app router path only (e.g. /careers); blocks absolute URLs. */
function normalizeLeadershipCtaPath(raw) {
  if (raw == null) return { value: null };
  const t = String(raw).trim().slice(0, 512);
  if (!t) return { value: null };
  if (t.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(t)) {
    return { error: 'ctaPath must be an app-relative path starting with /' };
  }
  if (!t.startsWith('/') || t.includes('..')) {
    return { error: 'ctaPath must be a single path starting with /' };
  }
  return { value: t };
}

function leadershipStaticPhotoPath(id) {
  return `leadership-${id}`;
}

function leadershipExpectedPublicPhotoPath(id) {
  return `/img/leadership/leadership-${id}.png`;
}

function portfolioStaticImagePath(id) {
  return `portfolio-${id}`;
}

function portfolioExpectedPublicImagePath(id) {
  return `/img/portfolio/portfolio-${id}.png`;
}

function publicPathToFsPath(publicPath) {
  const rel = String(publicPath || '').trim().replace(/^\/+/, '');
  if (!rel) return null;
  return path.join(__dirname, '..', 'front', ...rel.split('/')); 
}

function resolveLeadershipPhotoForResponse(member) {
  const primary = leadershipExpectedPublicPhotoPath(member.id);
  const legacyFlat = `/img/leadership-${member.id}.png`;
  for (const url of [primary, legacyFlat]) {
    const fsPath = publicPathToFsPath(url);
    if (fsPath && fs.existsSync(fsPath)) {
      return { ...member, photo_path: url };
    }
  }
  return { ...member, photo_path: '/img/leadership/placeholder-avatar.svg' };
}

async function syncLeadershipPhotoPaths(pool) {
  await pool.query("UPDATE leadership_members SET photo_path = CONCAT('leadership-', id)");
}

function resolvePortfolioImageForResponse(item) {
  const primary = portfolioExpectedPublicImagePath(item.id);
  const legacyFlat = `/img/portfolio-${item.id}.png`;
  for (const url of [primary, legacyFlat]) {
    const fsPath = publicPathToFsPath(url);
    if (fsPath && fs.existsSync(fsPath)) {
      return { ...item, image_path: url };
    }
  }
  return { ...item, image_path: '/img/leadership/placeholder-avatar.svg' };
}

async function syncPortfolioImagePaths(pool) {
  await pool.query("UPDATE portfolio_items SET image_path = CONCAT('portfolio-', id)");
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/jobs', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, title, description, location, employment_type, status, created_at, updated_at
       FROM jobs WHERE status = 'published' ORDER BY created_at DESC`
    );
    res.json({ jobs: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid job id' });
    return;
  }
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, title, description, location, employment_type, status, created_at, updated_at
       FROM jobs WHERE id = ? AND status = 'published' LIMIT 1`,
      [id]
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json({ job: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/mvp', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, focus, stage, status, sort_order, created_at, updated_at
       FROM mvp_items
       WHERE status = 'published'
       ORDER BY sort_order ASC, id ASC`
    );
    res.json({ items: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/jobs/:id/apply', applicationRateLimit, async (req, res) => {
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId) || jobId < 1) {
    res.status(400).json({ error: 'Invalid job id' });
    return;
  }
  const { fullName, email, phone, coverLetter, resumeUrl } = req.body || {};
  const name = (fullName || '').trim();
  const em = (email || '').trim();
  if (name.length < 2 || name.length > 255) {
    res.status(400).json({ error: 'Invalid fullName' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
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
  const resume = resumeNorm.value;

  try {
    const pool = getPool();
    const [check] = await pool.query('SELECT id FROM jobs WHERE id = ? AND status = ? LIMIT 1', [
      jobId,
      'published'
    ]);
    if (!check.length) {
      res.status(404).json({ error: 'Job not open for applications' });
      return;
    }

    await pool.query(
      `INSERT INTO job_applications (job_id, full_name, email, phone, cover_letter, resume_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [jobId, name, em, phoneT || null, cover || null, resume || null]
    );
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/login', authRateLimit, async (req, res) => {
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
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/jobs', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, title, description, location, employment_type, status, created_at, updated_at
       FROM jobs ORDER BY created_at DESC`
    );
    res.json({ jobs: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/jobs', authMiddleware, async (req, res) => {
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
    const pool = getPool();
    const [r] = await pool.query(
      `INSERT INTO jobs (title, description, location, employment_type, status)
       VALUES (?, ?, ?, ?, ?)`,
      [t, d, loc, et, st]
    );
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/jobs/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
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
    const [cur] = await pool.query('SELECT id FROM jobs WHERE id = ?', [id]);
    if (!cur.length) {
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
    vals.push(id);
    await pool.query(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/jobs/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    const pool = getPool();
    await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/applications', authMiddleware, async (req, res) => {
  const jobId = req.query.jobId != null ? Number(req.query.jobId) : null;
  try {
    const pool = getPool();
    let sql = `
      SELECT a.id, a.job_id, j.title AS job_title, a.full_name, a.email, a.phone, a.cover_letter, a.resume_url, a.created_at
      FROM job_applications a
      JOIN jobs j ON j.id = a.job_id
    `;
    const params = [];
    if (jobId && Number.isInteger(jobId) && jobId > 0) {
      sql += ' WHERE a.job_id = ?';
      params.push(jobId);
    }
    sql += ' ORDER BY a.created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ applications: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/applications/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM job_applications WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/mvp', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, focus, stage, status, sort_order, created_at, updated_at
       FROM mvp_items ORDER BY sort_order ASC, id ASC`
    );
    res.json({ items: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/mvp/reorder', authMiddleware, async (req, res) => {
  const ids = parsePositiveIntIdArray(req.body || {}, 'ids');
  if (!ids) {
    res.status(400).json({ error: 'ids must be a non-empty array of unique positive integers' });
    return;
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT id FROM mvp_items ORDER BY sort_order ASC, id ASC');
    const existing = rows.map((r) => r.id);
    if (existing.length !== ids.length) {
      await conn.rollback();
      res.status(400).json({ error: 'ids must list every MVP item exactly once' });
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
    for (let i = 0; i < ids.length; i += 1) {
      await conn.query('UPDATE mvp_items SET sort_order = ? WHERE id = ?', [i, ids[i]]);
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.post('/api/admin/mvp', authMiddleware, async (req, res) => {
  const { name, focus, stage, status } = req.body || {};
  const n = String(name || '').trim().slice(0, 128);
  const f = String(focus || '').trim();
  const stageNorm = normalizeMvpStage(stage != null ? stage : 'Prototyping', { required: true });
  if (stageNorm.error) {
    res.status(400).json({ error: stageNorm.error });
    return;
  }
  const stg = stageNorm.value;
  const pub = status === 'published' ? 'published' : 'draft';
  if (!n || !f) {
    res.status(400).json({ error: 'name, focus are required' });
    return;
  }
  try {
    const pool = getPool();
    const [ordRows] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) AS m FROM mvp_items');
    const ord = Number(ordRows[0]?.m ?? -1) + 1;
    const [r] = await pool.query(
      `INSERT INTO mvp_items (name, focus, stage, status, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [n, f, stg, pub, ord]
    );
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/mvp/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const { name, focus, stage, status } = req.body || {};
  const n = name != null ? String(name).trim().slice(0, 128) : null;
  const f = focus != null ? String(focus).trim() : null;
  let stg = null;
  if (stage != null) {
    const sn = normalizeMvpStage(stage, { required: true });
    if (sn.error) {
      res.status(400).json({ error: sn.error });
      return;
    }
    stg = sn.value;
  }
  const pub = status != null ? (status === 'published' ? 'published' : 'draft') : null;
  if (n !== null && !n) {
    res.status(400).json({ error: 'Invalid name' });
    return;
  }
  if (f !== null && !f) {
    res.status(400).json({ error: 'Invalid focus' });
    return;
  }
  try {
    const pool = getPool();
    const [cur] = await pool.query('SELECT id FROM mvp_items WHERE id = ?', [id]);
    if (!cur.length) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const fields = [];
    const vals = [];
    if (n !== null) {
      fields.push('name = ?');
      vals.push(n);
    }
    if (f !== null) {
      fields.push('focus = ?');
      vals.push(f);
    }
    if (stg !== null) {
      fields.push('stage = ?');
      vals.push(stg);
    }
    if (pub !== null) {
      fields.push('status = ?');
      vals.push(pub);
    }
    if (!fields.length) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }
    vals.push(id);
    await pool.query(`UPDATE mvp_items SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/admin/mvp/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    const pool = getPool();
    await pool.query('DELETE FROM mvp_items WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/leadership', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, role_title, blurb, photo_path, sort_order
       FROM leadership_members WHERE status = 'published' ORDER BY sort_order ASC, id ASC`
    );
    res.json({ members: rows.map(resolveLeadershipPhotoForResponse) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/portfolio', async (req, res) => {
  try {
    const pool = getPool();
    const [tabs] = await pool.query(
      `SELECT id, title, sort_order FROM portfolio_tabs WHERE status = 'published' ORDER BY sort_order ASC, id ASC`
    );
    const [items] = await pool.query(
      `SELECT pi.id, pi.tab_id, pi.title, pi.subtitle, pi.description, pi.image_path, pi.link_url, pi.sort_order
       FROM portfolio_items pi
       INNER JOIN portfolio_tabs pt ON pt.id = pi.tab_id AND pt.status = 'published'
       WHERE pi.status = 'published'
       ORDER BY pt.sort_order ASC, pi.sort_order ASC, pi.id ASC`
    );
    res.json({ tabs, items: items.map(resolvePortfolioImageForResponse) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/leadership', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, role_title, blurb, badge_label, photo_path, card_aria, cta_label, cta_aria, cta_path, open_seat, sort_order, status, created_at, updated_at
       FROM leadership_members ORDER BY sort_order ASC, id ASC`
    );
    res.json({ members: rows.map(resolveLeadershipPhotoForResponse) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/leadership/reorder', authMiddleware, async (req, res) => {
  const ids = parsePositiveIntIdArray(req.body || {}, 'ids');
  if (!ids) {
    res.status(400).json({ error: 'ids must be a non-empty array of unique positive integers' });
    return;
  }
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT id FROM leadership_members ORDER BY sort_order ASC, id ASC');
    const existing = rows.map((r) => r.id);
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
    for (let i = 0; i < ids.length; i += 1) {
      await conn.query('UPDATE leadership_members SET sort_order = ? WHERE id = ?', [i, ids[i]]);
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.post('/api/admin/portfolio/image', authMiddleware, (req, res, next) => {
  portfolioImageMemoryUpload.single('photo')(req, res, (err) => {
    if (err) {
      const code = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const msg =
        err.code === 'LIMIT_FILE_SIZE' ? 'Image too large (max 15 MB before processing)' : err.message || 'Upload failed';
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
    console.error(e);
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
    console.error(e);
    res.status(400).json({ error: 'Could not process image (try another file)' });
    return;
  }
  res.json({ imagePath: portfolioExpectedPublicImagePath(itemId) });
});

app.post('/api/admin/leadership', authMiddleware, async (req, res) => {
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
    const [ordRows] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) AS m FROM leadership_members');
    const sortOrder = Number(ordRows[0]?.m ?? -1) + 1;
    const [r] = await pool.query(
      `INSERT INTO leadership_members (name, role_title, blurb, badge_label, photo_path, card_aria, cta_label, cta_aria, cta_path, open_seat, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, roleTitle, blurb, badgeLabel, null, cardAria, ctaLabel, ctaAria, ctaPath, openSeat, sortOrder, status]
    );
    const staticPhotoPath = leadershipStaticPhotoPath(r.insertId);
    await pool.query('UPDATE leadership_members SET photo_path = ? WHERE id = ?', [staticPhotoPath, r.insertId]);
    res.status(201).json({ id: r.insertId, photoPath: staticPhotoPath });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/leadership/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const b = req.body || {};
  const name = b.name != null ? String(b.name).trim().slice(0, 128) : null;
  const roleTitle = b.roleTitle != null ? String(b.roleTitle).trim().slice(0, 255) : null;
  const blurb = b.blurb != null ? String(b.blurb).trim() : null;
  const badgeLabel = b.badgeLabel !== undefined ? (b.badgeLabel == null ? null : String(b.badgeLabel).trim().slice(0, 64) || null) : undefined;
  const cardAria = b.cardAria !== undefined ? (b.cardAria == null ? null : String(b.cardAria).trim().slice(0, 255) || null) : undefined;
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
    const [cur] = await pool.query('SELECT id, name FROM leadership_members WHERE id = ?', [id]);
    if (!cur.length) {
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
    vals.push(id);
    await pool.query(`UPDATE leadership_members SET ${fields.join(', ')} WHERE id = ?`, vals);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/leadership/:id/reorder', authMiddleware, async (req, res) => {
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
    const [rows] = await conn.query(
      `SELECT id FROM leadership_members ORDER BY sort_order ASC, id ASC`
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
      await conn.query('UPDATE leadership_members SET sort_order = ? WHERE id = ?', [k, newOrder[k]]);
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.delete('/api/admin/leadership/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    const pool = getPool();
    await pool.query('DELETE FROM leadership_members WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/portfolio/tabs', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, title, sort_order, status, created_at, updated_at FROM portfolio_tabs ORDER BY sort_order ASC, id ASC`
    );
    res.json({ tabs: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/portfolio/tabs/reorder', authMiddleware, async (req, res) => {
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
    for (let i = 0; i < ids.length; i += 1) {
      await conn.query('UPDATE portfolio_tabs SET sort_order = ? WHERE id = ?', [i, ids[i]]);
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.post('/api/admin/portfolio/tabs', authMiddleware, async (req, res) => {
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
    const [r] = await pool.query(
      `INSERT INTO portfolio_tabs (title, sort_order, status) VALUES (?, ?, ?)`,
      [title, sortOrder, status]
    );
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/portfolio/tabs/:id', authMiddleware, async (req, res) => {
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
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/portfolio/tabs/:id/reorder', authMiddleware, async (req, res) => {
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
    const [rows] = await conn.query(
      `SELECT id FROM portfolio_tabs ORDER BY sort_order ASC, id ASC`
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
      await conn.query('UPDATE portfolio_tabs SET sort_order = ? WHERE id = ?', [k, newOrder[k]]);
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.delete('/api/admin/portfolio/tabs/:id', authMiddleware, async (req, res) => {
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
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/portfolio/items', authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT pi.id, pi.tab_id, pt.title AS tab_title, pi.title, pi.subtitle, pi.description, pi.image_path, pi.link_url, pi.sort_order, pi.status, pi.created_at, pi.updated_at
       FROM portfolio_items pi
       INNER JOIN portfolio_tabs pt ON pt.id = pi.tab_id
       ORDER BY pt.sort_order ASC, pi.sort_order ASC, pi.id ASC`
    );
    res.json({ items: rows.map(resolvePortfolioImageForResponse) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/portfolio/items/reorder', authMiddleware, async (req, res) => {
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
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.post('/api/admin/portfolio/items', authMiddleware, async (req, res) => {
  const b = req.body || {};
  const tabId = Number(b.tabId);
  const title = String(b.title || '').trim().slice(0, 255);
  const subtitle = b.subtitle != null ? String(b.subtitle).trim().slice(0, 255) || null : null;
  const description = String(b.description || '').trim();
  const linkUrl = String(b.linkUrl || '').trim().slice(0, 1024);
  const status = b.status === 'published' ? 'published' : 'draft';
  if (!Number.isInteger(tabId) || tabId < 1 || !title || !description || !linkUrl) {
    res.status(400).json({ error: 'tabId, title, description, linkUrl required' });
    return;
  }
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
      `INSERT INTO portfolio_items (tab_id, title, subtitle, description, image_path, link_url, sort_order, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [tabId, title, subtitle, description, '', linkUrl, sortOrder, status]
    );
    const staticImagePath = portfolioStaticImagePath(r.insertId);
    await pool.query('UPDATE portfolio_items SET image_path = ? WHERE id = ?', [staticImagePath, r.insertId]);
    res.status(201).json({ id: r.insertId, imagePath: staticImagePath });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/admin/portfolio/items/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const b = req.body || {};
  const tabId = b.tabId != null ? Number(b.tabId) : null;
  const title = b.title != null ? String(b.title).trim().slice(0, 255) : null;
  const subtitle = b.subtitle !== undefined ? (b.subtitle == null ? null : String(b.subtitle).trim().slice(0, 255) || null) : undefined;
  const description = b.description != null ? String(b.description).trim() : null;
  const linkUrl = b.linkUrl != null ? String(b.linkUrl).trim().slice(0, 1024) : null;
  const status = b.status != null ? (b.status === 'published' ? 'published' : 'draft') : null;
  if (title !== null && !title) {
    res.status(400).json({ error: 'Invalid title' });
    return;
  }
  if (description !== null && !description) {
    res.status(400).json({ error: 'Invalid description' });
    return;
  }
  if (linkUrl !== null && !linkUrl) {
    res.status(400).json({ error: 'Invalid linkUrl' });
    return;
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
    const curTitle = curRows[0].title;
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
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/portfolio/items/:id/reorder', authMiddleware, async (req, res) => {
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
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

app.delete('/api/admin/portfolio/items/:id', authMiddleware, async (req, res) => {
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
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

async function start() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await ensureSchema(conn);
  } finally {
    conn.release();
  }
  await syncLeadershipPhotoPaths(pool);
  await seedCanonicalHomepageContent(pool, '[zentrox-api]');
  await syncPortfolioImagePaths(pool);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[zentrox-api] Listening on http://127.0.0.1:${PORT}`);
    console.log(
      '[zentrox-api] Drag-order endpoints (POST + JSON body): /api/admin/leadership/reorder { ids }, /api/admin/mvp/reorder { ids }, /api/admin/portfolio/tabs/reorder { ids }, /api/admin/portfolio/items/reorder { tabId, ids }'
    );
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
