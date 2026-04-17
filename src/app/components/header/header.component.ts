import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavigationService } from '../../core/navigation.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, LanguageSwitcherComponent, TranslatePipe],
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
}
