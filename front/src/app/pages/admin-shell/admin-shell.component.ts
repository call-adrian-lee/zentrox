import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../../core/admin-auth.service';
import { ADMIN_BASE_URL } from '../../core/admin-paths';
import { AdminNoticeStackComponent } from '../../components/admin-notice-stack/admin-notice-stack.component';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TextPipe, AdminNoticeStackComponent],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css'
})
export class AdminShellComponent {
  readonly router = inject(Router);
  readonly auth = inject(AdminAuthService);

  /** Sidebar `routerLink` targets (keep in sync with `ADMIN_BASE_URL`). */
  readonly adminNav = {
    leadership: `${ADMIN_BASE_URL}/leadership`,
    mvp: `${ADMIN_BASE_URL}/mvp`,
    portfolio: `${ADMIN_BASE_URL}/portfolio`,
    jobs: `${ADMIN_BASE_URL}/jobs`,
    applications: `${ADMIN_BASE_URL}/applications`
  } as const;

  showSidebar(): boolean {
    const u = this.router.url.split('?')[0].split('#')[0];
    return (
      u.includes(`${ADMIN_BASE_URL}/leadership`) ||
      u.includes(`${ADMIN_BASE_URL}/mvp`) ||
      u.includes(`${ADMIN_BASE_URL}/portfolio`) ||
      u.includes(`${ADMIN_BASE_URL}/jobs`) ||
      u.includes(`${ADMIN_BASE_URL}/applications`)
    );
  }
}
