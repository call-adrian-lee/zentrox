import { Component } from '@angular/core';
import { COMPANY } from '@core/company-info';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './about-section.component.html'
})
export class AboutSectionComponent {
  readonly c = COMPANY;
}
