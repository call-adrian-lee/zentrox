import { Component, computed, inject } from '@angular/core';
import { TextService } from '@shared/services/text.service';
import { TextPipe } from '@shared/pipes/text.pipe';

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
    return [
      { name: 'HowTube', outcomeKey: 'clients.howtube' as const },
      { name: 'OohYeah', outcomeKey: 'clients.oohyeah' as const },
      { name: 'Youtopia', outcomeKey: 'clients.youtopia' as const }
    ];
  });
}
