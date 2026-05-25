# Full-stack naming map

One logical entity → one naming chain across UI, API, and database.

## Open roles (careers)

| Layer | Name |
|-------|------|
| UI / copy | Open roles |
| Public URL | `/open-roles`, `/open-roles/:roleId/apply` |
| Front component | `OpenRolesComponent`, `OpenRoleApplyComponent` |
| Front model | `OpenRole`, `OpenRoleApplyPayload` |
| Public API | `GET /api/open-roles`, `GET /api/open-roles/:id`, `POST /api/open-roles/:id/applications` |
| Admin API | `/api/admin/open-roles`, `/api/admin/open-role-applications` |
| JSON (public list) | `{ roles: [...] }` |
| JSON (public detail) | `{ role: {...} }` |
| JSON (applications) | `role_id`, `role_title` (alias of `job_id`) |
| DB table | `jobs` (legacy table name; rows are open roles) |
| DB FK | `job_applications.job_id` → `jobs.id` |
| Service | `back/services/open-roles.service.js` |

Legacy front redirects only: `/careers`, `/jobs`, `/start` (see `site-nav.ts`).

## Get a quote

| Layer | Name |
|-------|------|
| UI / copy | Get a quote |
| Public URL | `/get-quote` |
| Front component | `GetQuoteComponent` |
| Front model | `Quote*`, `quote-form.ts` |
| Public API | `POST /api/quotes` |
| Admin API | `/api/admin/quotes` |
| JSON (admin list) | `{ quotes: [...] }` |
| DB table | `project_inquiries` (legacy; stores quote requests) |
| Service | `back/services/quotes.service.js` |

## Form payload ↔ API ↔ DB columns

### Open role apply

| Form control | API body (camelCase) | DB column |
|--------------|----------------------|-----------|
| `fullName` | `fullName` | `full_name` |
| `email` | `email` | `email` |
| `phone` | `phone` | `phone` |
| `coverLetter` | `coverLetter` | `cover_letter` |
| `resumeUrl` | `resumeUrl` | `resume_url` |

### Get a quote

| Form control | API body | DB column |
|--------------|----------|-----------|
| `fullName` | `fullName` | `full_name` |
| `email` | `email` | `email` |
| `company` | `company` | `company` |
| `phone` | `phone` | `phone` |
| `serviceType` | `serviceType` | `service_type` |
| `requirements` | `requirements` | `requirements` |
| `budgetRange` | `budgetRange` | `budget_range` |
| `timeline` | `timeline` | `timeline` |
| — | `source: 'website'` | `source` |

## Admin auth

| Layer | Name |
|-------|------|
| URL | `/admin-0911` |
| Login API | `POST /api/admin/login` |
| Account API | `GET/PUT /api/admin/account` |
| DB | `admin_users.username`, `password_hash` |

## Schema source of truth

Runtime DDL and migrations: `back/db.js` (`ensureSchema`).  
Reference copy for manual setup: `back/schema.sql` (keep in sync when schema changes).
