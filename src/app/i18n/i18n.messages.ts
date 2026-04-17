import type { AppLang } from './i18n.types';
import { enMessages } from './messages/en';
import { esMessages } from './messages/es';
import { zhMessages } from './messages/zh';

/** Parity with `en` is enforced by `messages-sync.spec.ts` (`npm run i18n:check`). */
export const MESSAGES: Record<AppLang, typeof enMessages> = {
  en: enMessages,
  es: esMessages as unknown as typeof enMessages,
  zh: zhMessages as unknown as typeof enMessages
};
