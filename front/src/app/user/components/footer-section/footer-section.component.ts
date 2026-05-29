import { Component, ViewEncapsulation, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TextPipe } from '@shared/pipes/text.pipe';
import { COMPANY } from '@core/company-info';
import { ROUTE_GET_QUOTE, ROUTE_OPEN_ROLES } from '@core/site-nav';
import { NavigationService } from '@user/services/navigation.service';

@Component({
  selector: 'app-footer-section',
  standalone: true,
  imports: [RouterLink, TextPipe],
  templateUrl: './footer-section.component.html',
  encapsulation: ViewEncapsulation.None
})
export class FooterSectionComponent {
  readonly nav = inject(NavigationService);
  readonly companyName = COMPANY.name;
  readonly slackHref = COMPANY.slackJoinUrl || COMPANY.slackFooterFallbackHref;
  readonly getQuotePath = ROUTE_GET_QUOTE;
  readonly openRolesPath = ROUTE_OPEN_ROLES;
}
