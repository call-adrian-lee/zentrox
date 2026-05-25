import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminAuthService } from '@admin/services/admin-auth.service';
import { AdminNotifyService } from '@admin/services/admin-notify.service';
import { TextPipe } from '@shared/pipes/text.pipe';

const ADMIN_USERNAME_PATTERN = /^[a-z0-9._-]{3,128}$/;

@Component({
  selector: 'app-admin-account',
  standalone: true,
  imports: [ReactiveFormsModule, TextPipe],
  templateUrl: './admin-account.component.html'
})
export class AdminAccountComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AdminAuthService);
  private readonly notify = inject(AdminNotifyService);

  readonly currentUsername = signal('');
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly submitting = signal(false);
  readonly errorKey = signal<string | null>(null);

  readonly form = this.fb.group({
    currentPassword: this.fb.control('', { validators: [Validators.required] }),
    newUsername: this.fb.control(''),
    newPassword: this.fb.control(''),
    confirmPassword: this.fb.control('')
  });

  ngOnInit(): void {
    this.loadAccount();
  }

  loadAccount(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.auth.getAccount().subscribe({
      next: (r) => {
        this.currentUsername.set(r.username);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    this.errorKey.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const current = this.currentUsername();
    const newUsernameRaw = v.newUsername.trim().toLowerCase();
    const newUsername =
      newUsernameRaw && newUsernameRaw !== current ? newUsernameRaw : '';
    const newPassword = v.newPassword;
    const confirmPassword = v.confirmPassword;

    if (!newUsername && !newPassword) {
      this.errorKey.set('admin.accountNothingToChange');
      return;
    }

    if (newUsername && !ADMIN_USERNAME_PATTERN.test(newUsername)) {
      this.errorKey.set('admin.accountUsernameInvalid');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        this.errorKey.set('admin.accountPasswordTooShort');
        return;
      }
      if (newPassword !== confirmPassword) {
        this.errorKey.set('admin.accountPasswordMismatch');
        return;
      }
    } else if (confirmPassword) {
      this.errorKey.set('admin.accountPasswordMismatch');
      return;
    }

    this.submitting.set(true);
    this.auth
      .updateAccount({
        currentPassword: v.currentPassword,
        ...(newUsername ? { newUsername } : {}),
        ...(newPassword ? { newPassword, confirmPassword } : {})
      })
      .subscribe({
        next: (r) => {
          this.currentUsername.set(r.username);
          this.form.reset({
            currentPassword: '',
            newUsername: '',
            newPassword: '',
            confirmPassword: ''
          });
          this.form.markAsPristine();
          this.form.markAsUntouched();
          this.submitting.set(false);
          this.notify.success('admin.accountSaved');
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.errorKey.set(this.resolveSaveErrorKey(err));
        }
      });
  }

  currentPasswordInvalid(): boolean {
    const c = this.form.controls.currentPassword;
    return c.touched && c.invalid;
  }

  private resolveSaveErrorKey(err: HttpErrorResponse): string {
    const msg = typeof err.error?.error === 'string' ? err.error.error : '';
    if (err.status === 409 || msg.includes('already taken')) {
      return 'admin.accountUsernameTaken';
    }
    if (msg.includes('Invalid current password') || msg.includes('Invalid credentials')) {
      return 'admin.accountCurrentPasswordInvalid';
    }
    if (msg.includes('do not match')) {
      return 'admin.accountPasswordMismatch';
    }
    if (msg.includes('at least 8')) {
      return 'admin.accountPasswordTooShort';
    }
    if (msg.includes('Nothing to change') || msg.includes('Provide newUsername')) {
      return 'admin.accountNothingToChange';
    }
    if (msg.includes('username must') || msg.includes('username may only')) {
      return 'admin.accountUsernameInvalid';
    }
    if (msg.includes('currentPassword required')) {
      return 'admin.accountCurrentPasswordInvalid';
    }
    return 'admin.accountSaveError';
  }
}
