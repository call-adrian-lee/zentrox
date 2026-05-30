import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '@admin/services/admin-auth.service';
import { ADMIN_NAV_GROUPS, isAdminSidebarRoute } from '@admin/core/admin-nav';
import { AdminNoticeStackComponent } from '@admin/components/admin-notice-stack/admin-notice-stack.component';
import { TextPipe } from '@shared/pipes/text.pipe';

const ADMIN_STYLESHEET = 'assets/styles/admin-components.css';
const ADMIN_STYLESHEET_MARKER = 'data-zt-admin-css';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TextPipe, AdminNoticeStackComponent],
  templateUrl: './admin-shell.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class AdminShellComponent implements OnInit {
  readonly router = inject(Router);
  readonly auth = inject(AdminAuthService);
  readonly navGroups = ADMIN_NAV_GROUPS;

  ngOnInit(): void {
    if (typeof document === 'undefined') return;
    if (document.querySelector(`link[${ADMIN_STYLESHEET_MARKER}]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL(ADMIN_STYLESHEET, document.baseURI).href;
    link.setAttribute(ADMIN_STYLESHEET_MARKER, '');
    document.head.appendChild(link);
  }

  showSidebar(): boolean {
    return isAdminSidebarRoute(this.router.url);
  }
}
