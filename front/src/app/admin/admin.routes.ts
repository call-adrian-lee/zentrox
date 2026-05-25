import { Routes } from '@angular/router';
import { adminAuthGuard } from '@admin/guards/admin-auth.guard';
import {
  ADMIN_ROUTE_ACCOUNT,
  ADMIN_ROUTE_APPLICATIONS,
  ADMIN_ROUTE_LEADERSHIP,
  ADMIN_ROUTE_OPEN_ROLES,
  ADMIN_ROUTE_PORTFOLIO,
  ADMIN_ROUTE_QUOTES,
  ADMIN_ROUTE_SEGMENT,
  LEGACY_ADMIN_ROUTE_GET_QUOTE,
  LEGACY_ADMIN_ROUTE_INQUIRIES,
  LEGACY_ADMIN_ROUTE_JOBS
} from '@admin/core/admin-paths';
import { adminRouteSeo } from '@core/route-seo';

export const adminRoutes: Routes = [
  {
    path: ADMIN_ROUTE_SEGMENT,
    loadComponent: () =>
      import('@admin/components/admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('@admin/pages/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
        data: { seo: adminRouteSeo.login }
      },
      {
        path: ADMIN_ROUTE_LEADERSHIP,
        canActivate: [adminAuthGuard],
        loadComponent: () =>
          import('@admin/pages/admin-leadership/admin-leadership.component').then((m) => m.AdminLeadershipComponent),
        data: { seo: adminRouteSeo.leadership }
      },
      {
        path: ADMIN_ROUTE_PORTFOLIO,
        canActivate: [adminAuthGuard],
        loadComponent: () =>
          import('@admin/pages/admin-portfolio/admin-portfolio.component').then((m) => m.AdminPortfolioComponent),
        data: { seo: adminRouteSeo.portfolio }
      },
      {
        path: ADMIN_ROUTE_QUOTES,
        canActivate: [adminAuthGuard],
        loadComponent: () => import('@admin/pages/admin-quotes/admin-quotes.component').then((m) => m.AdminQuotesComponent),
        data: { seo: adminRouteSeo.quotes }
      },
      { path: LEGACY_ADMIN_ROUTE_GET_QUOTE, redirectTo: ADMIN_ROUTE_QUOTES, pathMatch: 'full' },
      { path: LEGACY_ADMIN_ROUTE_INQUIRIES, redirectTo: ADMIN_ROUTE_QUOTES, pathMatch: 'full' },
      {
        path: ADMIN_ROUTE_OPEN_ROLES,
        canActivate: [adminAuthGuard],
        loadComponent: () =>
          import('@admin/pages/admin-open-roles/admin-open-roles.component').then((m) => m.AdminOpenRolesComponent),
        data: { seo: adminRouteSeo.openRoles }
      },
      { path: LEGACY_ADMIN_ROUTE_JOBS, redirectTo: ADMIN_ROUTE_OPEN_ROLES, pathMatch: 'full' },
      {
        path: ADMIN_ROUTE_APPLICATIONS,
        canActivate: [adminAuthGuard],
        loadComponent: () =>
          import('@admin/pages/admin-applications/admin-applications.component').then((m) => m.AdminApplicationsComponent),
        data: { seo: adminRouteSeo.applications }
      },
      {
        path: ADMIN_ROUTE_ACCOUNT,
        canActivate: [adminAuthGuard],
        loadComponent: () => import('@admin/pages/admin-account/admin-account.component').then((m) => m.AdminAccountComponent),
        data: { seo: adminRouteSeo.account }
      }
    ]
  }
];
