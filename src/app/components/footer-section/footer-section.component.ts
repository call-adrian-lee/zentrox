import { Component, ViewEncapsulation } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-footer-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './footer-section.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FooterSectionComponent {
  /** Replace with `COMPANY.linkedinUrl` (and `target="_blank"`) when ready */
  readonly linkedInHref = '#';
  /** Replace with Slack invite from `COMPANY` when ready */
  readonly slackHref = '#';
}
