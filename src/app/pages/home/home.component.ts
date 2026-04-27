import { Component, computed } from '@angular/core';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';
import { ClientsSectionComponent } from '../../components/clients-section/clients-section.component';
import { ContactSectionComponent } from '../../components/contact-section/contact-section.component';
import { CountersSectionComponent } from '../../components/counters-section/counters-section.component';
import { HeroCarouselComponent } from '../../components/hero-carousel/hero-carousel.component';
import { LeadershipSectionComponent } from '../../components/leadership-section/leadership-section.component';
import { PortfolioSectionComponent } from '../../components/portfolio-section/portfolio-section.component';
import { ServicesSectionComponent } from '../../components/services-section/services-section.component';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TextPipe,
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
  readonly mvpHref = computed(() => '/mvp');
}
