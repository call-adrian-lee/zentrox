import { Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY_QUOTE_FORM, resolveQuoteSubmitErrorKey } from '@shared/models/quote-form';
import { prefersReducedMotion } from '@shared/utils/motion';
import { QuoteApiService } from '@user/services/quote-api.service';
import {
  QUOTE_BUDGET_OPTIONS,
  QUOTE_SERVICE_OPTIONS,
  QUOTE_TIMELINE_OPTIONS,
  type QuoteBudgetRange,
  type QuoteServiceType,
  type QuoteTimeline
} from '@shared/models/quote.models';
import { COMPANY } from '@core/company-info';
import { SlackIconComponent } from '@shared/components/slack-icon.component';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-get-quote',
  standalone: true,
  imports: [ReactiveFormsModule, SlackIconComponent, TextPipe],
  templateUrl: './get-quote.component.html',
})
export class GetQuoteComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly quoteApi = inject(QuoteApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private successHideTimer: ReturnType<typeof setTimeout> | null = null;

  readonly slackHref = COMPANY.slackJoinUrl || COMPANY.slackFooterFallbackHref;
  readonly serviceOptions = QUOTE_SERVICE_OPTIONS;
  readonly budgetOptions = QUOTE_BUDGET_OPTIONS;
  readonly timelineOptions = QUOTE_TIMELINE_OPTIONS;

  readonly submitSuccess = signal(false);
  readonly submitting = signal(false);
  readonly submitErrorKey = signal<string | null>(null);

  readonly form = this.formBuilder.group({
    fullName: this.formBuilder.control(EMPTY_QUOTE_FORM.fullName, {
      validators: [Validators.required, Validators.maxLength(255)]
    }),
    email: this.formBuilder.control(EMPTY_QUOTE_FORM.email, {
      validators: [Validators.required, Validators.email]
    }),
    company: this.formBuilder.control(EMPTY_QUOTE_FORM.company, {
      validators: [Validators.maxLength(255)]
    }),
    phone: this.formBuilder.control(EMPTY_QUOTE_FORM.phone, { validators: [Validators.maxLength(64)] }),
    serviceType: this.formBuilder.control(EMPTY_QUOTE_FORM.serviceType, {
      validators: [Validators.required]
    }),
    requirements: this.formBuilder.control(EMPTY_QUOTE_FORM.requirements, {
      validators: [Validators.required, Validators.maxLength(20000)]
    }),
    budgetRange: this.formBuilder.control(EMPTY_QUOTE_FORM.budgetRange, {
      validators: [Validators.required]
    }),
    timeline: this.formBuilder.control(EMPTY_QUOTE_FORM.timeline)
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.clearSuccessTimer());
  }

  onFormKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const tag = target.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    event.preventDefault();
    this.submitQuote();
  }

  submitQuote(): void {
    this.dismissSuccessNotice();
    this.submitErrorKey.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const values = this.form.getRawValue();
    this.quoteApi
      .submitQuote({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        company: values.company.trim() || undefined,
        phone: values.phone.trim() || undefined,
        serviceType: values.serviceType as QuoteServiceType,
        requirements: values.requirements.trim(),
        budgetRange: values.budgetRange as QuoteBudgetRange,
        timeline: (values.timeline || undefined) as QuoteTimeline | undefined,
        source: 'website'
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.resetForm();
          this.showSuccessNotice();
        },
        error: (err: unknown) => {
          this.submitErrorKey.set(resolveQuoteSubmitErrorKey(err));
          this.submitting.set(false);
        }
      });
  }

  dismissSuccessNotice(): void {
    this.clearSuccessTimer();
    this.submitSuccess.set(false);
  }

  fieldInvalid(controlName: 'fullName' | 'email' | 'serviceType' | 'requirements' | 'budgetRange'): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.invalid;
  }

  emailFieldError(): 'required' | 'email' | null {
    const control = this.form.controls.email;
    if (!control.touched || control.valid) return null;
    if (control.errors?.['required']) return 'required';
    return 'email';
  }

  private resetForm(): void {
    this.form.reset({ ...EMPTY_QUOTE_FORM });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private showSuccessNotice(): void {
    this.submitSuccess.set(true);
    this.clearSuccessTimer();
    this.successHideTimer = setTimeout(() => this.submitSuccess.set(false), 6000);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    queueMicrotask(() => this.nameInput()?.nativeElement.focus());
  }

  private clearSuccessTimer(): void {
    if (this.successHideTimer) {
      clearTimeout(this.successHideTimer);
      this.successHideTimer = null;
    }
  }
}
