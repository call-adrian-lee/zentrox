import { Component, inject, signal } from '@angular/core';
import { COMPANY } from '../../core/company-info';
import { TextService } from '../../text/text.service';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './contact-section.component.html',
  styleUrl: './contact-section.component.css'
})
export class ContactSectionComponent {
  readonly c = COMPANY;
  readonly text = inject(TextService);
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
