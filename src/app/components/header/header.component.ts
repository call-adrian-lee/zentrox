import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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

  isFounderRoute(): boolean {
    const p = this.router.url.split('?')[0].split('#')[0];
    return p === '/us-founder-ceo';
  }

  isMinimalHeaderRoute(): boolean {
    return this.isMvpRoute() || this.isFounderRoute();
  }
}
