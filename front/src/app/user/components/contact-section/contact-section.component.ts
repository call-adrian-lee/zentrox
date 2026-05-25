import { Component, inject, signal } from '@angular/core';
import { COMPANY } from '@core/company-info';
import { SITE_IMAGES } from '@core/site-images';
import { TextService } from '@shared/services/text.service';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './contact-section.component.html',
})
export class ContactSectionComponent {
  readonly c = COMPANY;
  readonly contactMapPath = SITE_IMAGES.contactMap;
  readonly text = inject(TextService);
  readonly formStatus = signal('');
  readonly formStatusClass = signal('');
  readonly formSubmitting = signal(false);

  contactFormKeydown(ev: KeyboardEvent, form: HTMLFormElement): void {
    if (ev.key !== 'Enter') return;
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    const tag = t.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    ev.preventDefault();
    this.submitContact(new Event('submit'), form);
  }

  submitContact(event: Event, form: HTMLFormElement): void {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
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
        this.formStatus.set(this.text.t('contact.success'));
        this.formStatusClass.set('is-success');
      })
      .catch(() => {
        this.formStatus.set(this.text.t('contact.error'));
        this.formStatusClass.set('is-error');
      })
      .finally(() => this.formSubmitting.set(false));
  }
}
