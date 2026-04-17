import { Component, computed, inject } from '@angular/core';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';
import { ClientsSectionComponent } from '../../components/clients-section/clients-section.component';
import { ContactSectionComponent } from '../../components/contact-section/contact-section.component';
import { CountersSectionComponent } from '../../components/counters-section/counters-section.component';
import { HeroCarouselComponent } from '../../components/hero-carousel/hero-carousel.component';
import { LeadershipSectionComponent } from '../../components/leadership-section/leadership-section.component';
import { PortfolioSectionComponent } from '../../components/portfolio-section/portfolio-section.component';
import { ServicesSectionComponent } from '../../components/services-section/services-section.component';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TranslatePipe,
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
  private readonly i18n = inject(I18nService);

  /** Plain URL so `target="_blank"` always does a real navigation (SPA + `?hl=`). */
  readonly mvpHref = computed(() => {
    const hl = this.i18n.lang();
    return `/mvp?hl=${encodeURIComponent(hl)}`;
  });
}
