/**
 * Verify public + admin API wiring against a running server.
 * Usage: npm run verify:api --prefix back
 * Env: SMOKE_API_ORIGIN (default http://127.0.0.1:3000)
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

function assert(name, ok, detail) {
  if (!ok) {
    console.error(`[verify-api] FAIL ${name}:`, detail);
    process.exitCode = 1;
    return false;
  }
  console.log(`[verify-api] OK ${name}`);
  return true;
}

async function main() {
  const health = await request('GET', '/api/health');
  assert('GET /api/health', health.status === 200 && health.body?.db === true, health);

  const leadership = await request('GET', '/api/leadership');
  assert('GET /api/leadership', leadership.status === 200 && Array.isArray(leadership.body?.members), leadership);

  const portfolio = await request('GET', '/api/portfolio');
  assert(
    'GET /api/portfolio',
    portfolio.status === 200 && Array.isArray(portfolio.body?.tabs) && Array.isArray(portfolio.body?.items),
    portfolio
  );

  const openRoles = await request('GET', '/api/open-roles');
  assert('GET /api/open-roles', openRoles.status === 200 && Array.isArray(openRoles.body?.roles), openRoles);

  const stamp = Date.now();
  const quote = await request('POST', '/api/quotes', {
    fullName: `Verify ${stamp}`,
    email: `verify+${stamp}@example.com`,
    serviceType: 'web',
    requirements: 'Full-stack verification quote.',
    budgetRange: '10k_50k',
    timeline: 'flexible',
    source: 'website'
  });
  assert('POST /api/quotes', quote.status === 201 && quote.body?.ok === true, quote);

  const roleId = openRoles.body?.roles?.[0]?.id;
  if (roleId) {
    const role = await request('GET', `/api/open-roles/${roleId}`);
    assert('GET /api/open-roles/:id', role.status === 200 && role.body?.role?.id === roleId, role);

    const apply = await request('POST', `/api/open-roles/${roleId}/applications`, {
      fullName: 'Verify Applicant',
      email: `apply+${stamp}@example.com`,
      phone: '555-0100',
      coverLetter: 'Verification apply test.'
    });
    assert('POST /api/open-roles/:id/applications', apply.status === 201 && apply.body?.ok === true, apply);
  } else {
    console.log('[verify-api] SKIP apply — no published open roles');
  }

  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password) {
    console.log('[verify-api] SKIP admin — set ADMIN_BOOTSTRAP_PASSWORD in back/.env');
  } else {
    const username = process.env.ADMIN_BOOTSTRAP_USERNAME || 'admin';
    const login = await request('POST', '/api/admin/login', { username, password });
    assert('POST /api/admin/login', login.status === 200 && login.body?.token, login);
    const token = login.body.token;

    const adminQuotes = await request('GET', '/api/admin/quotes', null, token);
    assert('GET /api/admin/quotes', adminQuotes.status === 200 && Array.isArray(adminQuotes.body?.quotes), adminQuotes);

    const adminRoles = await request('GET', '/api/admin/open-roles', null, token);
    assert('GET /api/admin/open-roles', adminRoles.status === 200 && Array.isArray(adminRoles.body?.roles), adminRoles);

    const adminApps = await request('GET', '/api/admin/open-role-applications', null, token);
    assert(
      'GET /api/admin/open-role-applications',
      adminApps.status === 200 && Array.isArray(adminApps.body?.applications),
      adminApps
    );

    const adminLeadership = await request('GET', '/api/admin/leadership', null, token);
    assert(
      'GET /api/admin/leadership',
      adminLeadership.status === 200 && Array.isArray(adminLeadership.body?.members),
      adminLeadership
    );

    const row = adminQuotes.body?.quotes?.find((r) => r.email === `verify+${stamp}@example.com`);
    if (row) {
      const del = await request('DELETE', `/api/admin/quotes/${row.id}`, null, token);
      assert('DELETE /api/admin/quotes/:id', del.status === 200 && del.body?.ok === true, del);
    }
  }

  if (process.exitCode) {
    console.error('[verify-api] Some checks failed');
    process.exit(1);
  }
  console.log('[verify-api] All checks passed');
}

main().catch((err) => {
  console.error('[verify-api]', err);
  process.exit(1);
});
