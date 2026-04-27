import { AfterViewInit, Component, HostListener, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BackToTopComponent } from './components/back-to-top/back-to-top.component';
import { FooterSectionComponent } from './components/footer-section/footer-section.component';
import { HeaderComponent } from './components/header/header.component';
import { NavigationService } from './core/navigation.service';
import { TextPipe } from './text/text.pipe';
import type { SeoData } from './core/seo.models';
import { SeoService } from './core/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TextPipe, HeaderComponent, FooterSectionComponent, BackToTopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  private readonly navigation = inject(NavigationService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  readonly showPublicChrome = signal(true);
  readonly showHeader = signal(true);

  constructor() {
    effect(() => this.applySeoFromRouter());

    const syncRoute = () => {
      this.showHeader.set(!this.isFounderRoute());
      this.showPublicChrome.set(true);
      this.applySeoFromRouter();
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

  private isFounderRoute(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === '/us-founder-ceo';
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.navigation.onWindowScroll();
  }

  ngAfterViewInit(): void {
    this.navigation.onWindowScroll();
  }
}
