import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ADMIN_BASE_URL } from '@admin/core/admin-paths';
import {
  HOME_SECTION_HOME,
  HOME_SECTION_LEADERSHIP,
  HOME_SECTION_TESTIMONIALS,
  isOpenRolesPath,
  isQuotePagePath,
  ROUTE_GET_QUOTE,
  ROUTE_OPEN_ROLES
} from '@core/site-nav';
import { NavigationService } from '@user/services/navigation.service';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TextPipe],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  readonly nav = inject(NavigationService);
  readonly router = inject(Router);

  readonly homeSection = HOME_SECTION_HOME;
  readonly leadershipSection = HOME_SECTION_LEADERSHIP;
  readonly testimonialsSection = HOME_SECTION_TESTIMONIALS;
  /** Public URL path for the quote request page (`/get-quote`). */
  readonly quotePagePath = ROUTE_GET_QUOTE;
  readonly openRolesPath = ROUTE_OPEN_ROLES;

  isHomeRoute(): boolean {
    const p = this.router.url.split('?')[0].split('#')[0];
    return p === '/' || p === '';
  }

  isOpenRolesRoute(): boolean {
    const p = this.router.url.split('?')[0].split('#')[0];
    return isOpenRolesPath(p);
  }

  isCompactHeaderRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    if (isQuotePagePath(path)) return true;
    if (isOpenRolesPath(path)) return true;
    if (path === ADMIN_BASE_URL || path.startsWith(`${ADMIN_BASE_URL}/`)) return true;
    return false;
  }

  isQuotePageRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return isQuotePagePath(path);
  }
}
