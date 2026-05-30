import { Component, computed, inject } from '@angular/core';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { TextService } from '@shared/services/text.service';
import { TextPipe } from '@shared/pipes/text.pipe';
import { HOME_SECTION_TESTIMONIALS } from '@core/site-nav';
import { SITE_IMAGES, testimonialAvatarFallbackUrl } from '@core/site-images';
import { FEATURED_CLIENT_NAMES } from '@shared/constants/featured-clients';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  imports: [NgbCarousel, NgbSlide, TextPipe],
  templateUrl: './testimonials-section.component.html'
})
export class TestimonialsSectionComponent {
  readonly sectionId = HOME_SECTION_TESTIMONIALS;
  private readonly text = inject(TextService);

  trackTestimonial(_index: number, t: { personName: string }): string {
    return `${t.personName}-${this.text.lang()}`;
  }

  onClientImageError(ev: Event, index: number): void {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    const fallback = testimonialAvatarFallbackUrl(index as 0 | 1 | 2);
    if (img.src.includes(fallback)) return;
    img.src = fallback;
  }

  readonly testimonials = computed(() => {
    this.text.lang();
    return [
      {
        image: SITE_IMAGES.testimonialAvatars[0],
        personName: 'Alex Taylor',
        title: this.text.t('testimonials.t0.role'),
        company: FEATURED_CLIENT_NAMES[0],
        location: this.text.t('testimonials.t0.location'),
        quote: this.text.t('testimonials.t0.quote')
      },
      {
        image: SITE_IMAGES.testimonialAvatars[1],
        personName: 'Travis Allen',
        title: this.text.t('testimonials.t1.role'),
        company: FEATURED_CLIENT_NAMES[1],
        location: this.text.t('testimonials.t1.location'),
        quote: this.text.t('testimonials.t1.quote')
      },
      {
        image: SITE_IMAGES.testimonialAvatars[2],
        personName: 'Simeon Schnapper',
        title: this.text.t('testimonials.t2.role'),
        company: FEATURED_CLIENT_NAMES[2],
        location: this.text.t('testimonials.t2.location'),
        quote: this.text.t('testimonials.t2.quote')
      }
    ];
  });
}
