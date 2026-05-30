import { Component } from '@angular/core';
import { FaIconComponent } from '@shared/components/fa-icon.component';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-trust-bar',
  standalone: true,
  imports: [TextPipe, FaIconComponent],
  templateUrl: './trust-bar.component.html'
})
export class TrustBarComponent {}
