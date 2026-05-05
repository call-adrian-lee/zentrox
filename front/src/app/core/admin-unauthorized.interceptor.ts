import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

/**
 * Bearer-authenticated admin API calls: on 401, clear the session and open the sign-in page.
 * Login requests (no Authorization header) are left alone so bad passwords still show the form.
 */
export const adminUnauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AdminAuthService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        const hasBearer = !!req.headers.get('Authorization');
        const isLogin = req.url.includes('/admin/login');
        if (hasBearer && !isLogin) {
          auth.logout();
        }
      }
      return throwError(() => err);
    })
  );
};
