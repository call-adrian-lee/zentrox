# Zentrox Frontend

Angular app for the public website, careers pages, and admin UI.

## Run from repo root (recommended)

```bash
npm run setup
npm start
```

## Run only frontend

```bash
cd front
npm install
npm start
```

## Notes

- Dev server runs on `127.0.0.1:4200`.
- API calls are proxied from `/api` to `127.0.0.1:3000` via `proxy.conf.json`.
- Keep `front/node_modules`; if deleted, run `npm install` again in `front/`.
- **SEO / crawlers:** marketing routes are indexable; `/admin-0911` is `noindex` in route metadata and blocked in `public/robots.txt`. The sitemap lists public URLs only (`public/sitemap.xml`).
- **Accessibility:** skip link to `#main-content`, landmark roles, `prefers-reduced-motion`–aware in-page scrolling (`NavigationService`).
