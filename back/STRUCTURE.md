# Backend structure

Express + MySQL API for open roles, quotes, portfolio, leadership, and admin auth.

```
back/
├── index.js                 # Bootstrap: schema sync, listen
├── app.js                   # Express app factory (middleware + routes)
├── auth.js                  # JWT sign/verify + authMiddleware
├── db.js                    # Pool + ensureSchema() runtime migrations
├── schema.sql               # Reference DDL (optional manual setup)
├── seed-canonical.cjs       # Idempotent homepage seed
├── lib/
│   ├── logger.js
│   ├── validation.js
│   ├── media-paths.js
│   ├── quote-constants.js
│   ├── portfolio-upload.js
│   └── reorder.js
├── middleware/
│   ├── security.js
│   └── error-handler.js
├── services/                # SQL/data access
│   ├── open-roles.service.js
│   ├── quotes.service.js
│   ├── leadership.service.js
│   └── portfolio.service.js
├── routes/
│   ├── index.js             # registerRoutes(app, deps)
│   ├── user/                # Public site API (same /api/* paths)
│   │   ├── health.js
│   │   ├── open-roles.js
│   │   ├── quotes.js
│   │   ├── leadership.js
│   │   └── portfolio.js
│   └── admin/
│       ├── auth.js
│       ├── account.js
│       ├── open-roles.js
│       ├── applications.js
│       ├── quotes.js
│       ├── leadership.js
│       └── portfolio.js
└── scripts/
```

## Canonical API paths

| Feature | Public | Admin |
|---------|--------|-------|
| Open roles | `GET/POST /api/open-roles` | `/api/admin/open-roles` |
| Applications | `POST /api/open-roles/:id/applications` | `/api/admin/open-role-applications` |
| Quotes | `POST /api/quotes` | `/api/admin/quotes` |
| Leadership | `GET /api/leadership` | `/api/admin/leadership` |
| Portfolio | `GET /api/portfolio` | `/api/admin/portfolio/*` |
| Auth | — | `POST /api/admin/login`, `/api/admin/account` |

DB tables: `jobs`, `job_applications`, `project_inquiries`, `leadership_members`, `portfolio_tabs`, `portfolio_items`, `admin_users`.

Production deployment: see [`deploy/README.md`](../../deploy/README.md).
