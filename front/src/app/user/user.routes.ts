import { Routes } from '@angular/router';
import { userRouteSeo } from '@core/route-seo';

/** Public site routes (children of `UserLayoutComponent`). */
export const userRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@user/pages/home/home.component').then((m) => m.HomeComponent),
    data: { seo: userRouteSeo.home }
  },
  {
    path: 'open-roles',
    loadComponent: () => import('@user/pages/open-roles/open-roles.component').then((m) => m.OpenRolesComponent),
    data: { seo: userRouteSeo.openRoles }
  },
  {
    path: 'open-roles/:roleId/apply',
    loadComponent: () =>
      import('@user/pages/open-role-apply/open-role-apply.component').then((m) => m.OpenRoleApplyComponent),
    data: { seo: userRouteSeo.openRoleApply }
  },
  {
    path: 'get-quote',
    loadComponent: () => import('@user/pages/get-quote/get-quote.component').then((m) => m.GetQuoteComponent),
    data: { seo: userRouteSeo.getQuote }
  },
  { path: 'careers', redirectTo: 'open-roles', pathMatch: 'full' },
  { path: 'careers/:roleId/apply', redirectTo: 'open-roles/:roleId/apply', pathMatch: 'full' },
  { path: 'jobs', redirectTo: 'open-roles', pathMatch: 'full' },
  { path: 'jobs/:roleId/apply', redirectTo: 'open-roles/:roleId/apply', pathMatch: 'full' },
  { path: 'start', redirectTo: 'get-quote', pathMatch: 'full' }
];
