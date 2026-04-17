import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, HostListener, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BackToTopComponent } from './components/back-to-top/back-to-top.component';
import { FooterSectionComponent } from './components/footer-section/footer-section.component';
import { HeaderComponent } from './components/header/header.component';
import { NavigationService } from './core/navigation.service';
import { TranslatePipe } from './i18n/translate.pipe';
import { I18nService } from './i18n/i18n.service';
import type { SeoData } from './core/seo.models';
import { SeoService } from './core/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe, HeaderComponent, FooterSectionComponent, BackToTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  private readonly navigation = inject(NavigationService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(I18nService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly showPublicChrome = signal(true);

  constructor() {
    effect(() => {
      this.i18n.lang();
      this.applySeoFromRouter();
    });

    const syncRoute = () => {
      this.showPublicChrome.set(true);
      this.applySeoFromRouter();
      this.scheduleLangQuerySync();
    };
    syncRoute();
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(syncRoute);
  }

  private applySeoFromRouter(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const seoData = route.data['seo'] as SeoData | undefined;
    this.seo.apply(this.router.url, seoData);
  }

  /**
   * Keeps `?hl=` aligned with UI language. Deferred so we never call `navigate([])` during the
   * same macrotask as initial route activation — that can cancel deep links like `/mvp`.
   */
  private scheduleLangQuerySync(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => this.syncLangQueryParam(), 0);
  }

  private syncLangQueryParam(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const lang = this.i18n.lang();
    const tree = this.router.parseUrl(this.router.url);
    if (tree.queryParams['hl'] === lang) {
      return;
    }
    void this.router.navigate([], {
      queryParams: { hl: lang },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.navigation.onWindowScroll();
  }

  ngAfterViewInit(): void {
    this.navigation.onWindowScroll();
  }
}
