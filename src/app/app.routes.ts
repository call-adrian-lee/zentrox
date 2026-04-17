import { Routes } from '@angular/router';
import type { SeoData } from './core/seo.models';
import { MvpComponent } from './pages/mvp/mvp.component';

/** Exported for SEO fallback before lazy route `data` is attached (e.g. first effect tick). */
export const HOME_ROUTE_SEO: SeoData = {
  title: 'Zentrox LLC — U.S. SaaS & Product Engineering',
  description:
    'SaaS and web platform engineering for ambitious U.S. markets—partnerships with idea owners and investors. Web, APIs, AI, cloud, and Unity. Zentrox LLC, Austin, TX. Clear scopes, documentation, and U.S. business hours.',
  jsonLd: 'organization'
};

const homeSeo = HOME_ROUTE_SEO;

const mvpSeo: SeoData = {
  title: 'MVPs In Progress',
  description: 'Explore the SaaS MVP products currently being built by Zentrox.',
  robots: 'index, follow'
};

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    data: { seo: homeSeo }
  },
  {
    path: 'mvp',
    /** Eager standalone route avoids lazy-chunk 404 when hosting misconfigures chunk paths. */
    component: MvpComponent,
    data: { seo: mvpSeo }
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
