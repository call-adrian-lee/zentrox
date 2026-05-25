import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ADMIN_ROUTE_SEGMENT } from '@admin/core/admin-paths';
import { AdminAuthService } from '@admin/services/admin-auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  if (auth.hasToken()) return true;
  return router.createUrlTree(['/', ADMIN_ROUTE_SEGMENT]);
};
