# App structure — User & Admin

Two main areas plus shared infrastructure.

```
src/app/
├── user/                    # Public website
│   ├── components/          # Header, footer, layout, homepage sections
│   ├── pages/               # home, get-quote, open-roles, open-role-apply
│   ├── services/            # User API, SEO, navigation
│   └── user.routes.ts
│
├── admin/                   # Staff console (/admin-0911)
│   ├── components/          # Shell, notice stack
│   ├── pages/               # login, leadership, portfolio, quotes, open-roles, applications, …
│   ├── services/            # Admin API, auth, notify
│   ├── guards/
│   ├── interceptors/
│   ├── core/                # admin-paths, admin-nav
│   └── admin.routes.ts
│
├── shared/                  # Both sides
│   ├── models/
│   ├── pipes/               # TextPipe (`| t`)
│   ├── services/            # text.service
│   ├── utils/               # motion helpers
│   ├── app-copy.ts
│   └── html-content.ts
│
├── core/                    # Cross-cutting config
│   ├── api-url.ts
│   ├── site-nav.ts          # ROUTE_GET_QUOTE, ROUTE_OPEN_ROLES, openRoleApplyLink()
│   ├── site-images.ts       # Canonical /img/* paths
│   ├── route-seo.ts
│   └── company-info.ts
│
├── app.routes.ts
├── app.component.ts
└── app.config.ts
```

## Naming alignment

| Concept | URL | API | Page / component |
|---------|-----|-----|------------------|
| Get a quote | `/get-quote` | `POST /api/quotes` | `user/pages/get-quote/` · `GetQuoteComponent` |
| Open roles | `/open-roles` | `GET /api/open-roles` | `user/pages/open-roles/` · `OpenRolesComponent` |
| Apply | `/open-roles/:roleId/apply` | `POST …/applications` | `user/pages/open-role-apply/` · `OpenRoleApplyComponent` |
| Admin quotes | `/admin-0911/quotes` | `/api/admin/quotes` | `admin/pages/admin-quotes/` |

User HTTP services mirror admin: `OpenRolesApiService`, `QuoteApiService`, `LeadershipApiService`, `PortfolioApiService` under `user/services/*-api.service.ts`.

Legacy redirects: `/start` → get-quote; `/careers`, `/jobs` → open-roles.

## Path aliases

| Alias | Folder |
|-------|--------|
| `@user/*` | `app/user/` |
| `@admin/*` | `app/admin/` |
| `@shared/*` | `app/shared/` |
| `@core/*` | `app/core/` |

## Routing

- `app.routes.ts` → `UserLayoutComponent` + `userRoutes` (`user/user.routes.ts`)
- Admin → `AdminShellComponent` + `adminRoutes` (`admin/admin.routes.ts`)

Global styles live in `src/styles.css` and `src/assets/styles/`.
