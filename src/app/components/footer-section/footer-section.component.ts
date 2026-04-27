import { Component, ViewEncapsulation } from '@angular/core';
import { TextPipe } from '../../text/text.pipe';
import { COMPANY } from '../../core/company-info';

@Component({
  selector: 'app-footer-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './footer-section.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FooterSectionComponent {
  readonly linkedInHref = COMPANY.linkedinUrl;
  readonly slackHref = COMPANY.slackJoinUrl || COMPANY.slackFooterFallbackHref;
}
