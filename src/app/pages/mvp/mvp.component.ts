import { Component } from '@angular/core';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-mvp',
  standalone: true,
  imports: [TextPipe],
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
