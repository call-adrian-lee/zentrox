import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '@admin/services/admin-auth.service';
import { ADMIN_DEFAULT_URL } from '@admin/core/admin-paths';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, TextPipe],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorKey = signal<string | null>(null);

  readonly form = this.fb.group({
    username: this.fb.control('', { validators: [Validators.required] }),
    password: this.fb.control('', { validators: [Validators.required] })
  });

  constructor() {
    if (this.auth.hasToken()) {
      void this.router.navigateByUrl(ADMIN_DEFAULT_URL);
    }
  }

  loginFormKeydown(ev: KeyboardEvent): void {
    if (ev.key !== 'Enter') return;
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    const tag = t.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    ev.preventDefault();
    this.submit();
  }

  submit(): void {
    this.errorKey.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const v = this.form.getRawValue();
    this.auth.login(v.username.trim(), v.password).subscribe({
      next: () => {
        void this.router.navigateByUrl(ADMIN_DEFAULT_URL);
      },
      error: () => {
        this.errorKey.set('admin.loginError');
        this.submitting.set(false);
      }
    });
  }
}
