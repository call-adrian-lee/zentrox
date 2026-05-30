import { Component, inject } from '@angular/core';
import { ROUTE_GET_QUOTE } from '@core/site-nav';
import { NavigationService } from '@user/services/navigation.service';
import { FaIconComponent, type FaIconName } from '@shared/components/fa-icon.component';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-how-we-work-section',
  standalone: true,
  imports: [TextPipe, FaIconComponent],
  templateUrl: './how-we-work-section.component.html'
})
export class HowWeWorkSectionComponent {
  readonly nav = inject(NavigationService);
  readonly quotePath = ROUTE_GET_QUOTE;

  readonly steps: ReadonlyArray<{ icon: FaIconName; titleKey: string; bodyKey: string }> = [
    { icon: 'paper-plane', titleKey: 'howWeWork.step1.title', bodyKey: 'howWeWork.step1.body' },
    { icon: 'comments', titleKey: 'howWeWork.step2.title', bodyKey: 'howWeWork.step2.body' },
    { icon: 'list-alt', titleKey: 'howWeWork.step3.title', bodyKey: 'howWeWork.step3.body' },
    { icon: 'rocket', titleKey: 'howWeWork.step4.title', bodyKey: 'howWeWork.step4.body' }
  ];
}
