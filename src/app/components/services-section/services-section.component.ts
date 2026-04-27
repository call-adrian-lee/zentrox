import { Component } from '@angular/core';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './services-section.component.html'
})
export class ServicesSectionComponent {}
