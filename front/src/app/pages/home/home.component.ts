import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';
import { ClientsSectionComponent } from '../../components/clients-section/clients-section.component';
import { ContactSectionComponent } from '../../components/contact-section/contact-section.component';
import { CountersSectionComponent } from '../../components/counters-section/counters-section.component';
import { HeroCarouselComponent } from '../../components/hero-carousel/hero-carousel.component';
import { LeadershipSectionComponent } from '../../components/leadership-section/leadership-section.component';
import { PortfolioSectionComponent } from '../../components/portfolio-section/portfolio-section.component';
import { ServicesSectionComponent } from '../../components/services-section/services-section.component';
import { MvpPublicService } from '../../core/mvp-public.service';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TextPipe,
    RouterLink,
    HeroCarouselComponent,
    AboutSectionComponent,
    LeadershipSectionComponent,
    ServicesSectionComponent,
    CountersSectionComponent,
    PortfolioSectionComponent,
    ClientsSectionComponent,
    ContactSectionComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  private readonly mvpPublic = inject(MvpPublicService);
  private readonly destroyRef = inject(DestroyRef);

  /** -1 while loading; then published MVP count (list lives on /mvp only). */
  readonly mvpPublishedCount = signal(-1);

  constructor() {
    this.mvpPublic
      .listPublished()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => this.mvpPublishedCount.set((r.items || []).length),
        error: () => this.mvpPublishedCount.set(0)
      });
  }
}
