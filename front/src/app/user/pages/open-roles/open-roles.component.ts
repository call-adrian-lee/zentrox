import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { plainTextPreview } from '@shared/html-content';
import { OpenRolesApiService } from '@user/services/open-roles-api.service';
import type { OpenRole } from '@shared/models/open-roles.models';
import { SeoService } from '@user/services/seo.service';
import { TextPipe } from '@shared/pipes/text.pipe';
import { openRoleApplyHref, ROUTE_OPEN_ROLES } from '@core/site-nav';

@Component({
  selector: 'app-open-roles',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './open-roles.component.html',
})
export class OpenRolesComponent implements OnInit {
  private readonly openRolesApi = inject(OpenRolesApiService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  private static readonly DESCRIPTION_PREVIEW_CHARS = 280;

  readonly roles = signal<OpenRole[]>([]);
  readonly loadError = signal(false);
  readonly loading = signal(true);

  readonly openRolesPath = ROUTE_OPEN_ROLES;
  readonly openRoleApplyHref = openRoleApplyHref;

  ngOnInit(): void {
    this.openRolesApi
      .listPublished()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          const list = r.roles || [];
          this.roles.set(list);
          this.loading.set(false);
          this.seo.syncOpenRolesStructuredData(list);
        },
        error: () => {
          this.loadError.set(true);
          this.loading.set(false);
          this.seo.syncOpenRolesStructuredData([]);
        }
      });
  }

  descriptionPreview(description: string): string {
    return plainTextPreview(description, OpenRolesComponent.DESCRIPTION_PREVIEW_CHARS);
  }

  roleMeta(role: OpenRole): string {
    const parts = [role.location, role.employment_type].map((s) => (s || '').trim()).filter(Boolean);
    return parts.join(' · ');
  }
}
