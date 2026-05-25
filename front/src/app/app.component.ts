import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TextPipe } from '@shared/pipes/text.pipe';
import type { SeoData } from '@shared/models/seo.models';
import { SeoService } from '@user/services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TextPipe],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  constructor() {
    this.applySeoFromRouter();
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.applySeoFromRouter());
  }

  private applySeoFromRouter(): void {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const seoData = route.data['seo'] as SeoData | undefined;
    this.seo.apply(this.router.url, seoData);
  }
}
