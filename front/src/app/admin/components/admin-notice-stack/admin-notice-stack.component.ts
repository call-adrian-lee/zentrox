import { Component, inject } from '@angular/core';
import { AdminNotifyService } from '@admin/services/admin-notify.service';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-admin-notice-stack',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './admin-notice-stack.component.html',
})
export class AdminNoticeStackComponent {
  readonly notify = inject(AdminNotifyService);
}
