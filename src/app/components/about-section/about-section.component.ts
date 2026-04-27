import { Component } from '@angular/core';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './about-section.component.html'
})
export class AboutSectionComponent {}
