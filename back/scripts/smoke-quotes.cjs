/**
 * Smoke-test quotes: POST public, then admin list/update/delete.
 * Usage: npm run smoke:quotes --prefix back
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const http = require('http');

const API = process.env.SMOKE_API_ORIGIN || 'http://127.0.0.1:3000';

function request(method, path, body, token) {
  const url = new URL(path, API);
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: { Accept: 'application/json' }
    };
    if (body != null) opts.headers['Content-Type'] = 'application/json';
    if (token) opts.headers.Authorization = `Bearer ${token}`;
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = data ? JSON.parse(data) : null;
        } catch {
          /* keep raw */
        }
        resolve({ status: res.statusCode, body: parsed, raw: data });
      });
    });
    req.on('error', reject);
    if (body != null) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const health = await request('GET', '/api/health');
  if (health.status !== 200 || !health.body?.db) {
    console.error('[smoke-quotes] Health check failed:', health.status, health.body || health.raw);
    process.exit(1);
  }

  const stamp = Date.now();
  const post = await request('POST', '/api/quotes', {
    fullName: `Smoke Test ${stamp}`,
    email: `smoke+${stamp}@example.com`,
    serviceType: 'web',
    requirements: 'Automated smoke test quote for API and admin wiring.',
    budgetRange: '10k_50k',
    timeline: 'flexible'
  });
  if (post.status !== 201 || !post.body?.ok) {
    console.error('[smoke-quotes] POST /api/quotes failed:', post.status, post.body || post.raw);
    process.exit(1);
  }

  const username = process.env.ADMIN_BOOTSTRAP_USERNAME || 'admin';
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password) {
    console.error('[smoke-quotes] Set ADMIN_BOOTSTRAP_PASSWORD in back/.env');
    process.exit(1);
  }

  const login = await request('POST', '/api/admin/login', { username, password });
  if (login.status !== 200 || !login.body?.token) {
    console.error('[smoke-quotes] Admin login failed:', login.status, login.body || login.raw);
    process.exit(1);
  }

  const token = login.body.token;
  const list = await request('GET', '/api/admin/quotes', null, token);
  if (list.status !== 200 || !Array.isArray(list.body?.quotes)) {
    console.error('[smoke-quotes] Admin list failed:', list.status, list.body || list.raw);
    process.exit(1);
  }

  const row = list.body.quotes.find((r) => r.email === `smoke+${stamp}@example.com`);
  if (!row) {
    console.error('[smoke-quotes] Created quote not found in admin list');
    process.exit(1);
  }

  const patch = await request('PATCH', `/api/admin/quotes/${row.id}`, {
    status: 'contacted',
    adminNotes: 'smoke test'
  }, token);
  if (patch.status !== 200 || !patch.body?.ok) {
    console.error('[smoke-quotes] PATCH failed:', patch.status, patch.body || patch.raw);
    process.exit(1);
  }

  const del = await request('DELETE', `/api/admin/quotes/${row.id}`, null, token);
  if (del.status !== 200 || !del.body?.ok) {
    console.error('[smoke-quotes] DELETE failed:', del.status, del.body || del.raw);
    process.exit(1);
  }

  console.log('[smoke-quotes] OK — health, POST, admin list, PATCH, DELETE');
}

main().catch((err) => {
  console.error('[smoke-quotes]', err);
  process.exit(1);
});
