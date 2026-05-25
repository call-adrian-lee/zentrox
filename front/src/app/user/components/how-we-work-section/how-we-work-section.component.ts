import { Component, inject } from '@angular/core';
import { ROUTE_GET_QUOTE } from '@core/site-nav';
import { NavigationService } from '@user/services/navigation.service';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-how-we-work-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './how-we-work-section.component.html'
})
export class HowWeWorkSectionComponent {
  readonly nav = inject(NavigationService);
  readonly quotePath = ROUTE_GET_QUOTE;

  readonly steps = [
    { icon: 'fa-paper-plane', titleKey: 'howWeWork.step1.title', bodyKey: 'howWeWork.step1.body' },
    { icon: 'fa-comments', titleKey: 'howWeWork.step2.title', bodyKey: 'howWeWork.step2.body' },
    { icon: 'fa-list-alt', titleKey: 'howWeWork.step3.title', bodyKey: 'howWeWork.step3.body' },
    { icon: 'fa-rocket', titleKey: 'howWeWork.step4.title', bodyKey: 'howWeWork.step4.body' }
  ] as const;
}
