# Zentrox

Angular frontend app for the Zentrox website and public product pages.

```bash
npm install
npm start
```

Default local URL: `http://127.0.0.1:4200/`

## Main Routes

- `/` - Home page
- `/mvp` - SaaS MVP projects currently in progress

## Build and Test

- `npm run build` - Production build
- `npm run test` - Unit tests

## Content and SEO Notes

- Company/contact details are defined in `src/app/core/company-info.ts`.
- Route-level SEO metadata is configured in `src/app/app.routes.ts`.
- Meta tag and JSON-LD handling lives in `src/app/core/seo.service.ts`.
- Set `siteUrl` in `src/environments/environment.ts` for correct canonical and OG URLs.

## Public Assets

- Static assets are in `public/` and `img/`.
- Sitemap is in `public/sitemap.xml`; keep it updated when public routes change.
