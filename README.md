# Zentrox

Monorepo with two apps:

- `front/` - Angular website + careers + admin UI
- `back/` - Express + MySQL API

## Quick start

From repo root:

```bash
npm install
npm run setup
npm run db:bootstrap
npm run dev
```

`npm run dev` starts:

- Frontend: `http://127.0.0.1:4200`
- API: `http://127.0.0.1:3000`

## Package layout

This repo intentionally uses 3 npm trees (no workspaces):

- root `package.json` + `package-lock.json` (only orchestrator dependency: `concurrently`)
- `front/package.json` + `front/package-lock.json`
- `back/package.json` + `back/package-lock.json`

## Node modules policy

- `front/node_modules` and `back/node_modules` are required to run each app.
- root `node_modules` is optional and only needed for root scripts (`npm run dev`).
- deleting root `node_modules` is safe; run `npm install` at root when needed again.

## Useful commands (root)

- `npm run setup` - install dependencies in `front/` and `back/`
- `npm run dev` - run web + API together
- `npm start` - run web only
- `npm run api` - run API only
- `npm run db:bootstrap` - create DB/schema and seed admin/jobs

## Prerequisites

- Node.js 20+
- npm 11+
- MySQL on `127.0.0.1:3306` with credentials in `back/.env`

See `front/README.md` and `back/README.md` for app-specific notes.

## Security notes

- **Staff console** lives at `/admin-0911` (see `ADMIN_ROUTE_SEGMENT` in `front/src/app/core/admin-paths.ts`). Crawlers are discouraged via `robots.txt` (`Disallow: /admin-0911`); that is not authentication.
- **Protection** is bcrypt-hashed passwords, signed JWTs (`JWT_SECRET` must be 32+ characters), rate-limited login and application endpoints, CORS allowlist, and `helmet`. The API has **no alternate or hidden login bypass** — use `POST /api/admin/login` with legitimate credentials only.
- Rotate bootstrap admin credentials and JWT secret in production; treat any “undocumented backdoor” URL or token as compromise, not a feature.
