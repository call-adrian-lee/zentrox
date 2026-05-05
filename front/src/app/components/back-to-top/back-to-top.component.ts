import { Component, inject } from '@angular/core';
import { NavigationService } from '../../core/navigation.service';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './back-to-top.component.html'
})
export class BackToTopComponent {
  readonly nav = inject(NavigationService);
}
