import { Routes } from '@angular/router';
import { adminRoutes } from './admin/admin.routes';
import { userRoutes } from './user/user.routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@user/components/user-layout/user-layout.component').then((m) => m.UserLayoutComponent),
    children: userRoutes
  },
  ...adminRoutes,
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
