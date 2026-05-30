import { Component, inject } from '@angular/core';
import { NavigationService } from '@user/services/navigation.service';
import { FaIconComponent } from '@shared/components/fa-icon.component';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [TextPipe, FaIconComponent],
  templateUrl: './back-to-top.component.html'
})
export class BackToTopComponent {
  readonly nav = inject(NavigationService);
}
