import { Component } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './services-section.component.html'
})
export class ServicesSectionComponent {}
