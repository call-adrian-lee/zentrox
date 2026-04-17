import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { I18nService } from '../../i18n/i18n.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { NavigationService } from '../../core/navigation.service';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [NgbCarousel, NgbSlide, TranslatePipe],
  templateUrl: './hero-carousel.component.html'
})
export class HeroCarouselComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly i18n = inject(I18nService);
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

  readonly heroSlides = computed(() => {
    this.i18n.lang();
    return [
      {
        image: '/img/slider-0.jpg',
        altKey: 'hero.slide0.alt',
        titleKey: 'hero.slide0.title',
        textKey: 'hero.slide0.text',
        ctaKey: 'hero.slide0.cta',
        fragment: 'contact',
        navKey: 'contact' as const
      },
      {
        image: '/img/slider-1.jpg',
        altKey: 'hero.slide1.alt',
        titleKey: 'hero.slide1.title',
        textKey: 'hero.slide1.text',
        ctaKey: 'hero.slide1.cta',
        fragment: 'services',
        navKey: 'services' as const
      },
      {
        image: '/img/slider-2.jpg',
        altKey: 'hero.slide2.alt',
        titleKey: 'hero.slide2.title',
        textKey: 'hero.slide2.text',
        ctaKey: 'hero.slide2.cta',
        fragment: 'portfolio',
        navKey: 'portfolio' as const
      }
    ];
  });
}
