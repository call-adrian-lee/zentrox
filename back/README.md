# Zentrox API

Express + MySQL backend for open roles, quote requests, portfolio, leadership, and admin auth.

## Run from repo root (recommended)

```bash
npm run setup
npm run db:bootstrap
npm run api
```

`db:bootstrap` is safe to re-run: it merges any **missing** default leadership rows and portfolio `web` / `game` items (same copy as the original static homepage) without deleting rows you added in admin.

## Run only backend

```bash
cd back
npm install
npm start
```

## Environment

Copy `.env.example` to `.env` and set:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `JWT_SECRET`

## Security model

- Admin UI is served by the Angular app at `/admin-0911`; API routes use `Authorization: Bearer <jwt>` after `POST /api/admin/login`.
- There is **no hidden or secondary admin bypass** in this codebase. Strength comes from `JWT_SECRET`, password hashes, and rate limits — not from obscurity.

## Bootstrap admin credentials

`npm run db:bootstrap` always sets one admin user:

- username: `ADMIN_BOOTSTRAP_USERNAME` (default `admin`)
- password:
  - from `ADMIN_BOOTSTRAP_PASSWORD`, or
  - auto-generated securely and printed once in terminal if not provided

For production, always set both environment variables explicitly and rotate regularly.

## Leadership image handling

- No leadership upload endpoint is used.
- Column `leadership_members.name` is the person (or seat) **display name** (not “job title”; job postings use `jobs.title`).
- Column `leadership_members.photo_path` stores the token `leadership-{id}`; the site loads **`/img/leadership/leadership-{id}.png`** (legacy flat **`/img/leadership-{id}.png`** is still accepted if the nested file is missing).
- Canonical seed (`seed-canonical.cjs` / API startup) sets `photo_path` with `CONCAT('leadership-', id)` after inserts/updates.
- Put image files under **`front/img/leadership/`** as **`leadership-{id}.png`**.

## Portfolio image handling

- Thumbnails are **`/img/portfolio/portfolio-{itemId}.png`** under **`front/img/portfolio/`** (the API checks the file on disk; the DB value is normalized to `portfolio-{id}` on startup). Legacy flat **`/img/portfolio-{id}.png`** is still accepted if the nested file is missing.
- Canonical Web/Game items created by seed get **contiguous IDs after a fresh bootstrap only**; on an existing database, run `npm run migrate:portfolio-images --prefix back` once if you still have legacy `front/img/dev-web-*.JPG` / `dev-game-*.JPG` assets to convert. It maps each row **by tab + title**, writes PNGs, and optional flag `--remove-sources` deletes the old JPGs afterward.
- New clones that already include the generated PNGs under `front/img/portfolio/` do not need the migrate step.
