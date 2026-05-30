import { Component } from '@angular/core';
import { COMPANY } from '@core/company-info';
import { FaIconComponent } from '@shared/components/fa-icon.component';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [TextPipe, FaIconComponent],
  templateUrl: './about-section.component.html'
})
export class AboutSectionComponent {
  readonly c = COMPANY;
}
