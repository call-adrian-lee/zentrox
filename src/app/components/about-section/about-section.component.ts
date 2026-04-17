import { Component } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './about-section.component.html'
})
export class AboutSectionComponent {}
