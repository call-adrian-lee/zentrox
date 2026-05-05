import { Component, OnInit, inject, signal } from '@angular/core';
import { MvpPublicService } from '../../core/mvp-public.service';
import type { MvpItem } from '../../core/mvp.models';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-mvp',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './mvp.component.html'
})
export class MvpComponent implements OnInit {
  private readonly mvpApi = inject(MvpPublicService);

  readonly mvpRows = signal<MvpItem[]>([]);

  readonly loading = signal(true);
  readonly loadError = signal(false);

  ngOnInit(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.mvpApi.listPublished().subscribe({
      next: (r) => {
        this.mvpRows.set(r.items || []);
        this.loadError.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.mvpRows.set([]);
        this.loadError.set(true);
        this.loading.set(false);
      }
    });
  }
}
