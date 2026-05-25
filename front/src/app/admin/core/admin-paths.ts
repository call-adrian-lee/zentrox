/**
 * Public URL segment for the staff console (`/admin-0911/…`). Not a secret: real protection is JWT + bcrypt +
 * rate limits on `POST /api/admin/login`. Prefer strong `JWT_SECRET` and admin passwords in production.
 */
export const ADMIN_ROUTE_SEGMENT = 'admin-0911';

/** Client URL prefix: `/admin-0911`, `/admin-0911/quotes`, `/admin-0911/open-roles`, … */
export const ADMIN_BASE_URL = `/${ADMIN_ROUTE_SEGMENT}`;

/** Child route segments — keep in sync with `ADMIN_NAV_GROUPS` in `admin-nav.ts`. */
export const ADMIN_ROUTE_LEADERSHIP = 'leadership';
export const ADMIN_ROUTE_PORTFOLIO = 'portfolio';
export const ADMIN_ROUTE_QUOTES = 'quotes';
export const ADMIN_ROUTE_OPEN_ROLES = 'open-roles';
export const ADMIN_ROUTE_APPLICATIONS = 'applications';
export const ADMIN_ROUTE_ACCOUNT = 'account';

/** Legacy admin paths → redirect in `admin.routes.ts`. */
export const LEGACY_ADMIN_ROUTE_JOBS = 'jobs';
export const LEGACY_ADMIN_ROUTE_INQUIRIES = 'inquiries';
export const LEGACY_ADMIN_ROUTE_GET_QUOTE = 'get-quote';

export const ADMIN_DEFAULT_CHILD = ADMIN_ROUTE_LEADERSHIP;
export const ADMIN_DEFAULT_URL = `${ADMIN_BASE_URL}/${ADMIN_DEFAULT_CHILD}`;
