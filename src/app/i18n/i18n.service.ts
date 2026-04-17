import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MESSAGES } from './i18n.messages';
import type { AppLang } from './i18n.types';
import { APP_LANGS } from './i18n.types';

const STORAGE_KEY = 'zentrox.lang';

function readLangFromSearch(): AppLang | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const hl = new URLSearchParams(window.location.search).get('hl');
    if (hl && APP_LANGS.includes(hl as AppLang)) {
      return hl as AppLang;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getNested(obj: unknown, parts: string[]): unknown {
  let node: unknown = obj;
  for (const p of parts) {
    if (node !== null && typeof node === 'object' && p in (node as object)) {
      node = (node as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return node;
}

function detectInitialLang(): AppLang {
  const fromUrl = readLangFromSearch();
  if (fromUrl) {
    return fromUrl;
  }
  if (typeof localStorage === 'undefined') {
    return 'en';
  }
  const stored = localStorage.getItem(STORAGE_KEY) as AppLang | null;
  if (stored && APP_LANGS.includes(stored)) {
    return stored;
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
  if (nav.toLowerCase().startsWith('es')) {
    return 'es';
  }
  if (nav.toLowerCase().startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router, { optional: true });

  /** Current UI language */
  readonly lang = signal<AppLang>(detectInitialLang());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const fromUrl = readLangFromSearch();
      if (fromUrl) {
        localStorage.setItem(STORAGE_KEY, fromUrl);
      }
      this.applyDocumentLang(this.lang());
    }
  }

  setLang(code: AppLang): void {
    this.lang.set(code);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, code);
      this.applyDocumentLang(code);
      void this.router?.navigate([], {
        queryParams: { hl: code },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  /** Translate a dot-path key; falls back to English, then the key string. */
  t(key: string): string {
    this.lang();
    const lang = this.lang();
    const fromLang = this.lookup(lang, key);
    if (fromLang !== undefined) {
      return fromLang;
    }
    if (lang !== 'en') {
      const fromEn = this.lookup('en', key);
      if (fromEn !== undefined) {
        return fromEn;
      }
    }
    return key;
  }

  private lookup(lang: AppLang, key: string): string | undefined {
    const parts = key.split('.').filter(Boolean);
    const node = getNested(MESSAGES[lang], parts);
    return typeof node === 'string' ? node : undefined;
  }

  private applyDocumentLang(code: AppLang): void {
    const htmlLang = code === 'zh' ? 'zh-Hans' : code;
    this.document.documentElement.setAttribute('lang', htmlLang);
  }
}
