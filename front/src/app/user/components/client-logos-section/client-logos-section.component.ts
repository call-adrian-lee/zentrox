import { Component, computed, inject } from '@angular/core';
import { TextService } from '@shared/services/text.service';
import { TextPipe } from '@shared/pipes/text.pipe';
import { FEATURED_CLIENT_LOGOS } from '@shared/constants/featured-clients';

@Component({
  selector: 'app-client-logos-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './client-logos-section.component.html'
})
export class ClientLogosSectionComponent {
  private readonly text = inject(TextService);

  readonly clients = computed(() => {
    this.text.lang();
    return FEATURED_CLIENT_LOGOS;
  });
}
