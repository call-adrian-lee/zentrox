import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { adminBearerInterceptor } from '@admin/interceptors/admin-bearer.interceptor';
import { adminUnauthorizedInterceptor } from '@admin/interceptors/admin-unauthorized.interceptor';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([adminBearerInterceptor, adminUnauthorizedInterceptor])),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' }))
  ]
};
