import { Component } from '@angular/core';
import { FaIconComponent } from '@shared/components/fa-icon.component';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [TextPipe, FaIconComponent],
  templateUrl: './services-section.component.html'
})
export class ServicesSectionComponent {}
