import { Component, inject, signal } from '@angular/core';
import { COMPANY } from '../../core/company-info';
import { I18nService } from '../../i18n/i18n.service';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css'
})
export class ContactSectionComponent {
  readonly c = COMPANY;
  readonly i18n = inject(I18nService);
  readonly formStatus = signal('');
  readonly formStatusClass = signal('');
  readonly formSubmitting = signal(false);

  onContactSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const action = form.getAttribute('action');
    if (!action) {
      return;
    }
    this.formSubmitting.set(true);
    this.formStatus.set('');
    this.formStatusClass.set('');
    fetch(action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('failed');
        }
        form.reset();
        this.formStatus.set(this.i18n.t('contact.success'));
        this.formStatusClass.set('is-success');
      })
      .catch(() => {
        this.formStatus.set(this.i18n.t('contact.error'));
        this.formStatusClass.set('is-error');
      })
      .finally(() => this.formSubmitting.set(false));
  }
}
