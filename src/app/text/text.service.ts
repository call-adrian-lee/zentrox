import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { APP_TEXT } from './messages';

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

@Injectable({ providedIn: 'root' })
export class TextService {
  private readonly document = inject(DOCUMENT);

  /** App language is fixed to English. */
  readonly lang = signal<'en'>('en');

  constructor() {
    this.document.documentElement.setAttribute('lang', 'en-US');
  }

  /** Resolve a dot-path key, or fall back to the key string. */
  t(key: string): string {
    this.lang();
    const parts = key.split('.').filter(Boolean);
    const node = getNested(APP_TEXT, parts);
    return typeof node === 'string' ? node : key;
  }
}
