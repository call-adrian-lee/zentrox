import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JobsPublicService } from '../../core/jobs-public.service';
import type { Job } from '../../core/job.models';
import { SeoService } from '../../core/seo.service';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [RouterLink, TextPipe],
  templateUrl: './careers.component.html',
  styleUrl: './careers.component.css'
})
export class CareersComponent implements OnInit {
  private readonly jobsApi = inject(JobsPublicService);
  private readonly seo = inject(SeoService);
  /** Plain-text preview length for list cards only (full text on apply page). */
  private readonly CAREERS_DESCRIPTION_PREVIEW_CHARS = 280;

  readonly jobs = signal<Job[]>([]);
  readonly loadError = signal<string | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.jobsApi.listPublished().subscribe({
      next: (r) => {
        const list = r.jobs || [];
        this.jobs.set(list);
        this.loading.set(false);
        this.seo.syncCareersStructuredData(list);
      },
      error: () => {
        this.loadError.set('careers.loadError');
        this.loading.set(false);
        this.seo.syncCareersStructuredData([]);
      }
    });
  }

  /**
   * Short plain-text teaser for careers list. HTML from admin is stripped; full formatted body stays on `/careers/:id/apply`.
   */
  jobDescriptionPreview(raw: string | null | undefined): string {
    const plain = this.stripHtmlToPlain(String(raw ?? '')).replace(/\s+/g, ' ').trim();
    if (!plain) return '';
    const max = this.CAREERS_DESCRIPTION_PREVIEW_CHARS;
    if (plain.length <= max) return plain;
    const cut = plain.slice(0, max);
    const lastSpace = cut.lastIndexOf(' ');
    const end = lastSpace > max * 0.55 ? lastSpace : max;
    return `${cut.slice(0, end).trimEnd()}\u2026`;
  }

  private stripHtmlToPlain(html: string): string {
    const s = html.trim();
    if (!s) return '';
    const tpl = document.createElement('template');
    tpl.innerHTML = s;
    return tpl.content.textContent ?? '';
  }
}
