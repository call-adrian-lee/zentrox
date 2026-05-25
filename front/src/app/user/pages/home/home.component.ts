import { Component } from '@angular/core';
import { AboutSectionComponent } from '@user/components/about-section/about-section.component';
import { ContactSectionComponent } from '@user/components/contact-section/contact-section.component';
import { CountersSectionComponent } from '@user/components/counters-section/counters-section.component';
import { HeroCarouselComponent } from '@user/components/hero-carousel/hero-carousel.component';
import { LeadershipSectionComponent } from '@user/components/leadership-section/leadership-section.component';
import { PortfolioSectionComponent } from '@user/components/portfolio-section/portfolio-section.component';
import { ServicesSectionComponent } from '@user/components/services-section/services-section.component';
import { TestimonialsSectionComponent } from '@user/components/testimonials-section/testimonials-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroCarouselComponent,
    AboutSectionComponent,
    LeadershipSectionComponent,
    ServicesSectionComponent,
    CountersSectionComponent,
    PortfolioSectionComponent,
    TestimonialsSectionComponent,
    ContactSectionComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {}
