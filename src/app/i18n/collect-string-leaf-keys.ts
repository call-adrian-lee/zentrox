/** Dot-paths to every string leaf in a nested message tree (for parity checks). */
export function collectStringLeafKeys(node: unknown, prefix = ''): string[] {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) {
    return [];
  }
  const keys: string[] = [];
  for (const k of Object.keys(node as object).sort()) {
    const path = prefix ? `${prefix}.${k}` : k;
    const v = (node as Record<string, unknown>)[k];
    if (typeof v === 'string') {
      keys.push(path);
    } else if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...collectStringLeafKeys(v, path));
    }
  }
  return keys;
}

/** Paths present in `overlay` that are not in `base` (typos / stale translations). */
export function collectExtraLeafPaths(
  base: unknown,
  overlay: unknown,
  prefix = ''
): string[] {
  if (overlay === null || typeof overlay !== 'object' || Array.isArray(overlay)) {
    return [];
  }
  if (base === null || typeof base !== 'object' || Array.isArray(base)) {
    return collectStringLeafKeys(overlay, prefix);
  }
  const extra: string[] = [];
  const b = base as Record<string, unknown>;
  const o = overlay as Record<string, unknown>;
  for (const k of Object.keys(o)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (!(k in b)) {
      extra.push(...collectStringLeafKeys(o[k], path));
      continue;
    }
    const bv = b[k];
    const ov = o[k];
    if (typeof bv === 'string') {
      if (typeof ov !== 'string' && ov !== null && typeof ov === 'object' && !Array.isArray(ov)) {
        extra.push(...collectStringLeafKeys(ov, path));
      }
    } else if (bv !== null && typeof bv === 'object' && !Array.isArray(bv)) {
      if (typeof ov === 'string') {
        extra.push(path);
      } else if (ov !== null && typeof ov === 'object' && !Array.isArray(ov)) {
        extra.push(...collectExtraLeafPaths(bv, ov, path));
      }
    }
  }
  return extra;
}
