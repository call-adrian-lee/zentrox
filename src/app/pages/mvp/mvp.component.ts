import { Component } from '@angular/core';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-mvp',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './mvp.component.html'
})
export class MvpComponent {
  readonly mvpRows = [
    { slug: 'hireflowLite' as const, stageKey: 'prototyping' as const },
    { slug: 'clientPulse' as const, stageKey: 'integration' as const },
    { slug: 'sprintBoardAi' as const, stageKey: 'discovery' as const },
    { slug: 'opsDeskMini' as const, stageKey: 'pilot' as const }
  ] as const;
}
