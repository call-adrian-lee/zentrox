# Zentrox — Linux VPS deployment (Nginx + Node + MySQL)

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
cp .env.example .env
# Edit: MYSQL_*, JWT_SECRET (32+ chars), optional CORS_ORIGINS=https://zentrox.us
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

```ini
# /etc/systemd/system/zentrox-api.service
[Unit]
Description=Zentrox API
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/zentrox/back
Environment=NODE_ENV=production
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now zentrox-api
```

## 5. TLS (Let's Encrypt)

```bash
sudo certbot --nginx -d zentrox.us -d www.zentrox.us
```

## Health checks

- SPA: `https://zentrox.us/`
- API: `https://zentrox.us/api/health` → `{ "ok": true, "db": true }`

## Notes

- Admin UI: `/admin-0911` (blocked in `robots.txt`; not a security boundary).
- Portfolio uploads write to `front/img/portfolio/` by default; ensure `www-data` can write there.
- Leadership photos: place `leadership-{id}.png` under `front/img/leadership/`.
