/**
 * Public URL segment for the staff console (`/admin-0911/…`). Not a secret: real protection is JWT + bcrypt +
 * rate limits on `POST /api/admin/login`. Prefer strong `JWT_SECRET` and admin passwords in production.
 */
export const ADMIN_ROUTE_SEGMENT = 'admin-0911';

/** Client URL prefix: `/admin-0911`, `/admin-0911/jobs`, … */
export const ADMIN_BASE_URL = `/${ADMIN_ROUTE_SEGMENT}`;

/** First page after successful admin sign-in (child route under `ADMIN_BASE_URL`). */
export const ADMIN_DEFAULT_CHILD = 'leadership';

export const ADMIN_DEFAULT_URL = `${ADMIN_BASE_URL}/${ADMIN_DEFAULT_CHILD}`;
