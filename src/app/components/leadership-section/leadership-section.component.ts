import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-leadership-section',
  standalone: true,
  imports: [TextPipe, RouterLink],
  templateUrl: './leadership-section.component.html',
  styleUrl: './leadership-section.component.css'
})
export class LeadershipSectionComponent {}
