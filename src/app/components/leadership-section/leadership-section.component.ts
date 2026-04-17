import { Component } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-leadership-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './leadership-section.component.html',
  styleUrl: './leadership-section.component.css'
})
export class LeadershipSectionComponent {}
