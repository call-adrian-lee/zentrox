import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JobsPublicService } from '../../core/jobs-public.service';
import type { Job } from '../../core/job.models';
import { TextPipe } from '../../text/text.pipe';

function optionalHttpResumeUrl(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '').trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return { resumeUrlScheme: true };
    return null;
  } catch {
    return { resumeUrlInvalid: true };
  }
}

@Component({
  selector: 'app-job-apply',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TextPipe],
  templateUrl: './job-apply.component.html',
  styleUrl: './job-apply.component.css'
})
export class JobApplyComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobsApi = inject(JobsPublicService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly job = signal<Job | null>(null);
  readonly loadError = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly submitting = signal(false);

  readonly form = this.fb.group({
    fullName: this.fb.control('', { validators: [Validators.required, Validators.maxLength(255)] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    phone: this.fb.control(''),
    coverLetter: this.fb.control(''),
    resumeUrl: this.fb.control('', { validators: [Validators.maxLength(1024), optionalHttpResumeUrl] })
  });

  private jobId = 0;

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('jobId');
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 1) {
      void this.router.navigateByUrl('/careers');
      return;
    }
    this.jobId = id;
    this.jobsApi.getPublished(id).subscribe({
      next: (r) => {
        this.job.set(r.job);
      },
      error: () => {
        this.loadError.set(true);
      }
    });
  }

  submit(): void {
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const v = this.form.getRawValue();
    this.jobsApi
      .apply(this.jobId, {
        fullName: v.fullName.trim(),
        email: v.email.trim(),
        phone: v.phone.trim() || undefined,
        coverLetter: v.coverLetter.trim() || undefined,
        resumeUrl: v.resumeUrl.trim() || undefined
      })
      .subscribe({
        next: () => {
          this.submitted.set(true);
          this.submitting.set(false);
        },
        error: () => {
          this.submitError.set('apply.submitError');
          this.submitting.set(false);
        }
      });
  }

  /** Renders rich-text from admin HTML, or escapes plain-text with preserved line breaks. */
  jobDescriptionHtml(raw: string | null | undefined): string {
    const src = String(raw ?? '').trimEnd();
    if (!src) return '';
    if (/<[a-z][\s\S]*>/i.test(src)) return src;
    return this.escapeHtml(src).replace(/\r?\n/g, '<br>');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
