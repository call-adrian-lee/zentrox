import { Component, computed, inject } from '@angular/core';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { TextService } from '@shared/services/text.service';
import { TextPipe } from '@shared/pipes/text.pipe';
import { HOME_SECTION_TESTIMONIALS } from '@core/site-nav';
import { SITE_IMAGES } from '@core/site-images';

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

  readonly testimonials = computed(() => {
    this.text.lang();
    return [
      {
        image: SITE_IMAGES.testimonialAvatars[0],
        personName: 'Alex Taylor',
        title: this.text.t('testimonials.t0.role'),
        company: 'HowTube',
        location: this.text.t('testimonials.t0.location'),
        quote: this.text.t('testimonials.t0.quote')
      },
      {
        image: SITE_IMAGES.testimonialAvatars[1],
        personName: 'Travis Allen',
        title: this.text.t('testimonials.t1.role'),
        company: 'OohYeah',
        location: this.text.t('testimonials.t1.location'),
        quote: this.text.t('testimonials.t1.quote')
      },
      {
        image: SITE_IMAGES.testimonialAvatars[2],
        personName: 'Simeon Schnapper',
        title: this.text.t('testimonials.t2.role'),
        company: 'Youtopia',
        location: this.text.t('testimonials.t2.location'),
        quote: this.text.t('testimonials.t2.quote')
      }
    ];
  });
}
