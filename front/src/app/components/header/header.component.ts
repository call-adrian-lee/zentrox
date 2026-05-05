import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ADMIN_BASE_URL } from '../../core/admin-paths';
import { NavigationService } from '../../core/navigation.service';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, TextPipe],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  readonly nav = inject(NavigationService);
  readonly router = inject(Router);

  isHomeRoute(): boolean {
    const p = this.router.url.split('?')[0].split('#')[0];
    return p === '/' || p === '';
  }

  /** MVP page: show logo only (no nav / language / mobile menu). */
  isMvpRoute(): boolean {
    const p = this.router.url.split('?')[0].split('#')[0];
    return p === '/mvp';
  }

  isCareersRoute(): boolean {
    const p = this.router.url.split('?')[0].split('#')[0];
    return p === '/careers' || p.startsWith('/careers/');
  }

  isMinimalHeaderRoute(): boolean {
    const p = this.router.url.split('?')[0].split('#')[0];
    if (this.isMvpRoute()) return true;
    if (p === '/careers' || p.startsWith('/careers/')) return true;
    if (p === ADMIN_BASE_URL || p.startsWith(`${ADMIN_BASE_URL}/`)) return true;
    return false;
  }
}
