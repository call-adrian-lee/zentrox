import { Component, computed, inject } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { I18nService } from '../../i18n/i18n.service';
import type { AppLang } from '../../i18n/i18n.types';
import { TranslatePipe } from '../../i18n/translate.pipe';

/** ISO 3166-1 alpha-2 codes for https://flagcdn.com (US, Spain, China). */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [NgbDropdownModule, TranslatePipe],
  templateUrl: './language-switcher.component.html'
})
export class LanguageSwitcherComponent {
  readonly i18n = inject(I18nService);

  readonly options = [
    { code: 'en' as AppLang, flagCode: 'us', labelKey: 'lang.en' },
    { code: 'es' as AppLang, flagCode: 'es', labelKey: 'lang.es' },
    { code: 'zh' as AppLang, flagCode: 'cn', labelKey: 'lang.zh' }
  ];

  readonly active = computed(() => {
    const code = this.i18n.lang();
    return this.options.find((o) => o.code === code) ?? this.options[0];
  });

  /** flagcdn.com — US, ES, CN flags */
  flagSrc(code: string): string {
    return `https://flagcdn.com/w40/${code}.png`;
  }
}
