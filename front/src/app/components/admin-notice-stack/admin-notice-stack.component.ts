import { Component, inject } from '@angular/core';
import { AdminNotifyService } from '../../core/admin-notify.service';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-admin-notice-stack',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './admin-notice-stack.component.html',
  styleUrl: './admin-notice-stack.component.css'
})
export class AdminNoticeStackComponent {
  readonly notify = inject(AdminNotifyService);
}
