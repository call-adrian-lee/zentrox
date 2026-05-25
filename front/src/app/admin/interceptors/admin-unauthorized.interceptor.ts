import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from '@admin/services/admin-auth.service';

/** On 401 for bearer admin API calls, clear session (except login). */
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
