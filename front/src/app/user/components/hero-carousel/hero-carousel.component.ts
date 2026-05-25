import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { TextService } from '@shared/services/text.service';
import { TextPipe } from '@shared/pipes/text.pipe';
import { ROUTE_GET_QUOTE } from '@core/site-nav';
import { SITE_IMAGES } from '@core/site-images';
import { NavigationService } from '@user/services/navigation.service';
import type { HeroSlide } from './hero-carousel.types';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [NgbCarousel, NgbSlide, TextPipe],
  templateUrl: './hero-carousel.component.html'
})
export class HeroCarouselComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly text = inject(TextService);
  readonly nav = inject(NavigationService);

  /** Disables auto-rotation and slide animation when the user prefers reduced motion. */
  private readonly reducedMotion = signal(false);

  readonly carouselInterval = computed(() => (this.reducedMotion() ? 0 : 5000));
  readonly carouselAnimation = computed(() => !this.reducedMotion());

  constructor() {
    afterNextRender(() => {
      if (
        isPlatformBrowser(this.platformId) &&
        typeof matchMedia !== 'undefined' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        this.reducedMotion.set(true);
      }
    });
  }

  readonly heroSlides = computed((): HeroSlide[] => {
    this.text.lang();
    return [
      {
        image: SITE_IMAGES.heroSlides[0],
        altKey: 'hero.slide0.alt',
        titleKey: 'hero.slide0.title',
        textKey: 'hero.slide0.text',
        ctaKey: 'hero.slide0.cta',
        route: ROUTE_GET_QUOTE
      },
      {
        image: SITE_IMAGES.heroSlides[1],
        altKey: 'hero.slide1.alt',
        titleKey: 'hero.slide1.title',
        textKey: 'hero.slide1.text',
        ctaKey: 'hero.slide1.cta',
        fragment: 'services',
        navKey: 'services'
      },
      {
        image: SITE_IMAGES.heroSlides[2],
        altKey: 'hero.slide2.alt',
        titleKey: 'hero.slide2.title',
        textKey: 'hero.slide2.text',
        ctaKey: 'hero.slide2.cta',
        fragment: 'portfolio',
        navKey: 'portfolio'
      }
    ];
  });
}
