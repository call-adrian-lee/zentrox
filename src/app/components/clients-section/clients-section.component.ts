import { Component, computed, inject } from '@angular/core';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { I18nService } from '../../i18n/i18n.service';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-clients-section',
  standalone: true,
  imports: [NgbCarousel, NgbSlide, TranslatePipe],
  templateUrl: './clients-section.component.html'
})
export class ClientsSectionComponent {
  private readonly i18n = inject(I18nService);

  /** Include language in track so slide templates refresh when switching locale (ngb-carousel caches inner views). */
  trackTestimonial(_index: number, t: { personName: string }): string {
    return `${t.personName}-${this.i18n.lang()}`;
  }

  /** Resolved strings (not `| t` in the carousel) so ng-bootstrap slides update when language changes. */
  readonly testimonials = computed(() => {
    this.i18n.lang();
    return [
      {
        image: '/img/client-0.jpg',
        personName: 'Alex Taylor',
        title: this.i18n.t('clients.t0.role'),
        company: 'HowTube',
        location: this.i18n.t('clients.t0.location'),
        quote: this.i18n.t('clients.t0.quote')
      },
      {
        image: '/img/client-1.jpg',
        personName: 'Travis Yates',
        title: this.i18n.t('clients.t1.role'),
        company: 'OohYeah',
        location: this.i18n.t('clients.t1.location'),
        quote: this.i18n.t('clients.t1.quote')
      },
      {
        image: '/img/client-2.jpg',
        personName: 'Simeon Schnapper',
        title: this.i18n.t('clients.t2.role'),
        company: 'Youtopia',
        location: this.i18n.t('clients.t2.location'),
        quote: this.i18n.t('clients.t2.quote')
      }
    ];
  });
}
