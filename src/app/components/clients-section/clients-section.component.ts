import { Component, computed, inject } from '@angular/core';
import { NgbCarousel, NgbSlide } from '@ng-bootstrap/ng-bootstrap';
import { TextService } from '../../text/text.service';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-clients-section',
  standalone: true,
  imports: [NgbCarousel, NgbSlide, TextPipe],
  templateUrl: './clients-section.component.html'
})
export class ClientsSectionComponent {
  private readonly text = inject(TextService);

  /** Include language in track so carousel slide views refresh. */
  trackTestimonial(_index: number, t: { personName: string }): string {
    return `${t.personName}-${this.text.lang()}`;
  }

  /** Resolve strings in TS so ng-bootstrap slides update reactively. */
  readonly testimonials = computed(() => {
    this.text.lang();
    return [
      {
        image: '/img/client-0.jpg',
        personName: 'Alex Taylor',
        title: this.text.t('clients.t0.role'),
        company: 'HowTube',
        location: this.text.t('clients.t0.location'),
        quote: this.text.t('clients.t0.quote')
      },
      {
        image: '/img/client-1.jpg',
        personName: 'Travis Yates',
        title: this.text.t('clients.t1.role'),
        company: 'OohYeah',
        location: this.text.t('clients.t1.location'),
        quote: this.text.t('clients.t1.quote')
      },
      {
        image: '/img/client-2.jpg',
        personName: 'Simeon Schnapper',
        title: this.text.t('clients.t2.role'),
        company: 'Youtopia',
        location: this.text.t('clients.t2.location'),
        quote: this.text.t('clients.t2.quote')
      }
    ];
  });
}
