import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { roleDescriptionHtml } from '@shared/html-content';
import { OpenRolesApiService } from '@user/services/open-roles-api.service';
import { SeoService } from '@user/services/seo.service';
import type { OpenRole } from '@shared/models/open-roles.models';
import { ROUTE_OPEN_ROLES } from '@core/site-nav';
import { TextPipe } from '@shared/pipes/text.pipe';

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
  selector: 'app-open-role-apply',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TextPipe],
  templateUrl: './open-role-apply.component.html',
})
export class OpenRoleApplyComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly openRolesApi = inject(OpenRolesApiService);
  private readonly seo = inject(SeoService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly openRolesPath = ROUTE_OPEN_ROLES;

  readonly role = signal<OpenRole | null>(null);
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

  readonly roleDescriptionHtml = roleDescriptionHtml;

  private roleId = 0;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const raw = params.get('roleId');
          const id = Number(raw);
          if (!Number.isInteger(id) || id < 1) {
            void this.router.navigateByUrl(ROUTE_OPEN_ROLES);
            return EMPTY;
          }
          this.roleId = id;
          this.role.set(null);
          this.loadError.set(false);
          this.submitted.set(false);
          this.submitError.set(null);
          this.form.reset();
          return this.openRolesApi.getPublished(id);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (r) => {
          if (!r?.role) return;
          this.role.set(r.role);
          this.seo.applyRolePage(r.role);
        },
        error: () => {
          this.loadError.set(true);
        }
      });
  }

  applyFormKeydown(ev: KeyboardEvent): void {
    if (ev.key !== 'Enter') return;
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    const tag = t.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    ev.preventDefault();
    this.submit();
  }

  submit(): void {
    this.submitError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const v = this.form.getRawValue();
    this.openRolesApi
      .apply(this.roleId, {
        fullName: v.fullName.trim(),
        email: v.email.trim(),
        phone: v.phone.trim() || undefined,
        coverLetter: v.coverLetter.trim() || undefined,
        resumeUrl: v.resumeUrl.trim() || undefined
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitted.set(true);
          this.submitting.set(false);
        },
        error: () => {
          this.submitError.set('openRoleApply.submitError');
          this.submitting.set(false);
        }
      });
  }
}
