import { Component, inject } from '@angular/core';
import { NavigationService } from '../../core/navigation.service';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './back-to-top.component.html'
})
export class BackToTopComponent {
  readonly nav = inject(NavigationService);
}
