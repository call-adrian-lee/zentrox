import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '@admin/services/admin-auth.service';
import { ADMIN_NAV_GROUPS, isAdminSidebarRoute } from '@admin/core/admin-nav';
import { AdminNoticeStackComponent } from '@admin/components/admin-notice-stack/admin-notice-stack.component';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TextPipe, AdminNoticeStackComponent],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent {
  readonly router = inject(Router);
  readonly auth = inject(AdminAuthService);
  readonly navGroups = ADMIN_NAV_GROUPS;

  showSidebar(): boolean {
    return isAdminSidebarRoute(this.router.url);
  }
}
