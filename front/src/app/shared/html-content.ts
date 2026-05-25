/** Escape plain text for safe HTML insertion. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Strip HTML tags and collapse whitespace for list previews. */
export function plainTextFromHtml(raw: string): string {
  return String(raw ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Plain-text teaser with optional max length (adds ellipsis when truncated). */
export function plainTextPreview(raw: string, maxChars: number): string {
  const plain = plainTextFromHtml(raw);
  if (plain.length <= maxChars) return plain;
  return `${plain.slice(0, maxChars).trimEnd()}…`;
}

/** Renders admin rich-text HTML, or escapes plain text with preserved line breaks. */
export function roleDescriptionHtml(raw: string | null | undefined): string {
  const src = String(raw ?? '').trimEnd();
  if (!src) return '';
  if (/<[a-z][\s\S]*>/i.test(src)) return src;
  return escapeHtml(src).replace(/\r?\n/g, '<br>');
}
