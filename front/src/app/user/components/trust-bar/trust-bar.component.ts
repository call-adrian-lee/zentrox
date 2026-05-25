import { Component } from '@angular/core';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-trust-bar',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './trust-bar.component.html'
})
export class TrustBarComponent {}
