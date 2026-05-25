import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { AdminAuthService } from '@admin/services/admin-auth.service';

function isJwtProtectedAdminApi(req: { url: string }): boolean {
  const u = req.url;
  if (u.includes('/api/admin/login')) return false;
  return u.includes('/api/admin/');
}

/** Injects `Authorization: Bearer …` for `/api/admin/*` except login. */
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
