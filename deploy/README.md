# Zentrox — Linux VPS deployment (Nginx + Node + MySQL)

## Pre-deploy checklist (run locally before pushing to VPS)

```bash
# From repo root
cd front && npm ci && npm run build && cd ..
cd back && npm ci && cd ..
# API must be running with valid back/.env for smoke tests:
npm run verify:api --prefix back
```

- [ ] `front/dist/zentrox/browser/` exists (includes `index.html`, `404.html`)
- [ ] `environment.ts` has correct `siteUrl` (e.g. `https://zentrox.us`)
- [ ] `back/.env` on server will **not** be committed (see `deploy/env.production.example`)
- [ ] Strong `JWT_SECRET` (32+ chars) and MySQL password set on VPS
- [ ] `front/img/` leadership + portfolio assets deployed with the app
- [ ] `www-data` can write `front/img/portfolio/` (admin uploads)

Production layout on a single VPS:

```
/var/www/zentrox/
├── front/dist/zentrox/browser/   # Angular build (static SPA)
├── front/img/                    # Static images (leadership PNGs, portfolio uploads)
├── back/                         # Node API
└── back/.env                     # Secrets (never commit)
```

## 1. Build frontend

```bash
cd front
npm ci
npm run build
```

Output: `front/dist/zentrox/browser/` (includes `404.html` for SPA fallback).

## 2. Configure API

```bash
cd back
cp ../deploy/env.production.example .env
# Edit: MYSQL_* (or MYSQL_SOCKET), JWT_SECRET (32+ chars), TRUST_PROXY=1
npm ci
npm run db:bootstrap
```

Run API with a process manager (systemd example below) or PM2:

```bash
npm start
```

Default listen: `http://127.0.0.1:3000`

## 3. Install Nginx config

Copy [`deploy/nginx/zentrox.conf`](nginx/zentrox.conf) to the server:

```bash
sudo cp deploy/nginx/zentrox.conf /etc/nginx/sites-available/zentrox.conf
sudo ln -sf /etc/nginx/sites-available/zentrox.conf /etc/nginx/sites-enabled/zentrox.conf
sudo nginx -t && sudo systemctl reload nginx
```

Edit `server_name`, `root`, and SSL certificate paths in the config before enabling HTTPS.

## 4. systemd unit (API)

```bash
sudo cp deploy/systemd/zentrox-api.service /etc/systemd/system/zentrox-api.service
sudo chown -R www-data:www-data /var/www/zentrox/front/img/portfolio
sudo systemctl daemon-reload
sudo systemctl enable --now zentrox-api
sudo systemctl status zentrox-api
```

Unit file: [`deploy/systemd/zentrox-api.service`](systemd/zentrox-api.service) (loads `back/.env`, runs as `www-data`).

## 5. TLS (Let's Encrypt)

```bash
sudo certbot --nginx -d zentrox.us -d www.zentrox.us
```

## Health checks

- SPA: `https://zentrox.us/`
- API: `https://zentrox.us/api/health` → `{ "ok": true, "db": true }`

## VPS packages (Ubuntu 22.04+)

```bash
sudo apt update
sudo apt install -y nginx mysql-server nodejs npm certbot python3-certbot-nginx
# Node 20+ required — use NodeSource or nvm if distro node is older
node -v   # must be >= 20
```

## Notes

- Admin UI: `/admin-0911` (blocked in `robots.txt`; not a security boundary).
- Portfolio uploads write to `front/img/portfolio/` by default; ensure `www-data` can write there.
- Leadership photos: place `leadership-{id}.png` under `front/img/leadership/`.
- On Ubuntu MySQL, prefer `MYSQL_SOCKET=/var/run/mysqld/mysqld.sock` in `back/.env` (see `deploy/env.production.example`).
