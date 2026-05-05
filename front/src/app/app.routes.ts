import { Routes } from '@angular/router';
import { adminAuthGuard } from './core/admin-auth.guard';
import { ADMIN_ROUTE_SEGMENT } from './core/admin-paths';
import type { SeoData } from './core/seo.models';
import { APP_TEXT } from './text/app-copy';
import { MvpComponent } from './pages/mvp/mvp.component';

/** Exported for SEO fallback before lazy route `data` is attached (e.g. first effect tick). */
export const HOME_ROUTE_SEO: SeoData = {
  title: APP_TEXT.seo.homeTitle,
  description: APP_TEXT.seo.homeDescription,
  keywords: APP_TEXT.seo.homeKeywords,
  jsonLd: 'organization'
};

const homeSeo = HOME_ROUTE_SEO;

const mvpSeo: SeoData = {
  title: APP_TEXT.seo.mvpTitle,
  description: APP_TEXT.seo.mvpDescription,
  keywords: APP_TEXT.seo.mvpKeywords,
  robots: 'index, follow'
};

const careersSeo: SeoData = {
  title: APP_TEXT.seo.careersTitle,
  description: APP_TEXT.seo.careersDescription,
  keywords: APP_TEXT.seo.careersKeywords,
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
};

const jobApplySeo: SeoData = {
  title: APP_TEXT.seo.jobApplyTitle,
  description: APP_TEXT.seo.jobApplyDescription,
  keywords: APP_TEXT.seo.jobApplyKeywords,
  robots: 'index, follow'
};

const adminLoginSeo: SeoData = {
  title: 'Admin — Sign in',
  description: 'Zentrox job board administration.',
  robots: 'noindex, nofollow'
};

const adminJobsSeo: SeoData = {
  title: 'Admin — Job postings',
  description: 'Manage Zentrox job postings.',
  robots: 'noindex, nofollow'
};

const adminMvpSeo: SeoData = {
  title: 'Admin — MVP items',
  description: 'Manage Zentrox MVP cards.',
  robots: 'noindex, nofollow'
};

const adminLeadershipSeo: SeoData = {
  title: 'Admin — Leadership',
  description: 'Manage Zentrox leadership profiles on the public site.',
  robots: 'noindex, nofollow'
};

const adminPortfolioSeo: SeoData = {
  title: 'Admin — Portfolio',
  description: 'Manage portfolio tabs and items on the public site.',
  robots: 'noindex, nofollow'
};

const adminAppsSeo: SeoData = {
  title: 'Admin — Applications',
  description: 'Review job applications submitted through the careers page.',
  robots: 'noindex, nofollow'
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
  {
    path: 'careers',
    loadComponent: () => import('./pages/careers/careers.component').then((m) => m.CareersComponent),
    data: { seo: careersSeo }
  },
  {
    path: 'careers/:jobId/apply',
    loadComponent: () => import('./pages/job-apply/job-apply.component').then((m) => m.JobApplyComponent),
    data: { seo: jobApplySeo }
  },
  {
    path: ADMIN_ROUTE_SEGMENT,
    loadComponent: () => import('./pages/admin-shell/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
        data: { seo: adminLoginSeo }
      },
      {
        path: 'leadership',
        canActivate: [adminAuthGuard],
        loadComponent: () =>
          import('./pages/admin-leadership/admin-leadership.component').then((m) => m.AdminLeadershipComponent),
        data: { seo: adminLeadershipSeo }
      },
      {
        path: 'mvp',
        canActivate: [adminAuthGuard],
        loadComponent: () => import('./pages/admin-mvp/admin-mvp.component').then((m) => m.AdminMvpComponent),
        data: { seo: adminMvpSeo }
      },
      {
        path: 'portfolio',
        canActivate: [adminAuthGuard],
        loadComponent: () =>
          import('./pages/admin-portfolio/admin-portfolio.component').then((m) => m.AdminPortfolioComponent),
        data: { seo: adminPortfolioSeo }
      },
      {
        path: 'jobs',
        canActivate: [adminAuthGuard],
        loadComponent: () => import('./pages/admin-jobs/admin-jobs.component').then((m) => m.AdminJobsComponent),
        data: { seo: adminJobsSeo }
      },
      {
        path: 'applications',
        canActivate: [adminAuthGuard],
        loadComponent: () =>
          import('./pages/admin-applications/admin-applications.component').then((m) => m.AdminApplicationsComponent),
        data: { seo: adminAppsSeo }
      }
    ]
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];
