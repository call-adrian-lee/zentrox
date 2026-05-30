import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, of, Subject, switchMap, tap } from 'rxjs';
import { retryTransientApi } from '@core/api-retry';
import { TextPipe } from '@shared/pipes/text.pipe';
import { LeadershipApiService } from '@user/services/leadership-api.service';
import { leadershipPhotoUrl, type LeadershipMemberPublic } from '@shared/models/leadership.models';
import { SITE_IMAGES } from '@core/site-images';

@Component({
  selector: 'app-leadership-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './leadership-section.component.html',
})
export class LeadershipSectionComponent {
  private readonly api = inject(LeadershipApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly loadTrigger$ = new Subject<void>();
  readonly placeholderAvatarPath = SITE_IMAGES.leadershipPlaceholder;
  readonly leaderPhotoUrl = leadershipPhotoUrl;

  readonly members = signal<LeadershipMemberPublic[]>([]);
  readonly loadError = signal(false);
  readonly loading = signal(true);

  constructor() {
    merge(of(undefined), this.loadTrigger$)
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.loadError.set(false);
        }),
        switchMap(() => this.api.listPublished().pipe(retryTransientApi())),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
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

  retryLoad(): void {
    this.loadTrigger$.next();
  }

  onLeaderImageError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src.includes(this.placeholderAvatarPath)) return;
    img.src = this.placeholderAvatarPath;
  }
}
