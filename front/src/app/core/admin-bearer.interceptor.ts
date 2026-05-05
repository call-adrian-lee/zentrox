import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

/** Matches dashboard API URLs (not the SPA route `admin-0911`). */
function isJwtProtectedAdminApi(req: { url: string }): boolean {
  const u = req.url;
  if (u.includes('/api/admin/login')) return false;
  return u.includes('/api/admin/');
}

/**
 * Injects `Authorization: Bearer …` for `/api/admin/*` except login.
 * Missing token becomes a 401 Observable error (no sync throw) so callers still subscribe and handlers run.
 */
export const adminBearerInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isJwtProtectedAdminApi(req)) return next(req);
  const auth = inject(AdminAuthService);
  const token = auth.getToken();
  if (!token) {
    return throwError(
      () => new HttpErrorResponse({ status: 401, statusText: 'Not authenticated', url: req.url })
    );
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
