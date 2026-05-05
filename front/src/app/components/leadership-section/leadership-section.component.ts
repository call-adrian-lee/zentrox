import { Component, inject, signal } from '@angular/core';
import { TextPipe } from '../../text/text.pipe';
import { LeadershipPublicService } from '../../core/leadership-public.service';
import type { LeadershipMemberPublic } from '../../core/leadership.models';

@Component({
  selector: 'app-leadership-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './leadership-section.component.html',
  styleUrl: './leadership-section.component.css'
})
export class LeadershipSectionComponent {
  private readonly api = inject(LeadershipPublicService);
  readonly placeholderAvatarPath = '/img/upload/leadership/placeholder-avatar.svg';

  readonly members = signal<LeadershipMemberPublic[]>([]);
  readonly loadError = signal(false);
  readonly loading = signal(true);

  constructor() {
    this.api.listPublished().subscribe({
      next: (r) => {
        this.members.set(r.members || []);
        this.loadError.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      }
    });
  }

  onLeaderImageError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src.includes(this.placeholderAvatarPath)) return;
    img.src = this.placeholderAvatarPath;
  }

  /** DB stores `leadership-{id}` or full `/img/...` paths; browser needs a real URL. */
  leaderPhotoUrl(m: LeadershipMemberPublic): string {
    const raw = (m.photo_path || '').trim();
    if (!raw) return `/img/leadership/leadership-${m.id}.png`;
    if (raw.startsWith('/')) return raw;
    if (raw.includes('/')) return raw.startsWith('/') ? raw : `/${raw}`;
    if (/^leadership-\d+$/i.test(raw)) return `/img/leadership/${raw}.png`;
    if (/\.(png|jpe?g|webp|gif)$/i.test(raw)) return `/img/${raw}`;
    return `/img/${raw}.png`;
  }
}
