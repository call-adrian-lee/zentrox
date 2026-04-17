import { describe, expect, it } from 'vitest';
import { collectExtraLeafPaths, collectStringLeafKeys } from './collect-string-leaf-keys';
import { enMessages } from './messages/en';
import { esMessages } from './messages/es';
import { zhMessages } from './messages/zh';

describe('i18n message trees (en / es / zh)', () => {
  const enKeys = collectStringLeafKeys(enMessages);
  const enSet = new Set(enKeys);

  it('Spanish has the same string keys as English', () => {
    const esKeys = collectStringLeafKeys(esMessages);
    expect(new Set(esKeys)).toEqual(enSet);
  });

  it('Chinese has the same string keys as English', () => {
    const zhKeys = collectStringLeafKeys(zhMessages);
    expect(new Set(zhKeys)).toEqual(enSet);
  });

  it('Spanish has no orphan keys vs English', () => {
    expect(collectExtraLeafPaths(enMessages, esMessages)).toEqual([]);
  });

  it('Chinese has no orphan keys vs English', () => {
    expect(collectExtraLeafPaths(enMessages, zhMessages)).toEqual([]);
  });
});
