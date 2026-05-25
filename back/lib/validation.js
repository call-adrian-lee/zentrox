/** Shared request validation and normalization helpers. */

function parsePositiveIntIdArray(body, key = 'ids') {
  const raw = body && body[key];
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out = [];
  for (const x of raw) {
    const n = Number(x);
    if (!Number.isInteger(n) || n < 1) return null;
    out.push(n);
  }
  if (new Set(out).size !== out.length) return null;
  return out;
}

function normalizeAdminUsername(raw) {
  return String(raw || '').trim().toLowerCase();
}

function validateAdminUsername(raw) {
  const username = normalizeAdminUsername(raw);
  if (!username || username.length < 3 || username.length > 128) {
    return { error: 'username must be 3–128 characters' };
  }
  if (!/^[a-z0-9._-]+$/.test(username)) {
    return { error: 'username may only contain letters, numbers, dots, hyphens, and underscores' };
  }
  return { username };
}

function normalizeOptionalResumeUrl(raw) {
  if (raw == null) return { value: null };
  const t = String(raw).trim();
  if (!t) return { value: null };
  const s = t.slice(0, 1024);
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { error: 'resumeUrl must use http or https' };
    }
    return { value: s };
  } catch {
    return { error: 'Invalid resumeUrl' };
  }
}

function normalizeRequiredHttpUrl(raw, fieldName = 'linkUrl') {
  const t = String(raw || '').trim().slice(0, 1024);
  if (!t) return { error: `${fieldName} is required` };
  try {
    const u = new URL(t);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { error: `${fieldName} must use http or https` };
    }
    return { value: t };
  } catch {
    return { error: `Invalid ${fieldName}` };
  }
}

function normalizeLeadershipCtaPath(raw) {
  if (raw == null) return { value: null };
  const t = String(raw).trim().slice(0, 512);
  if (!t) return { value: null };
  if (t.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(t)) {
    return { error: 'ctaPath must be an app-relative path starting with /' };
  }
  if (!t.startsWith('/') || t.includes('..')) {
    return { error: 'ctaPath must be a single path starting with /' };
  }
  return { value: t };
}

function normalizeQuoteOptional(value, maxLen) {
  if (value == null) return null;
  const t = String(value).trim();
  if (!t) return null;
  return t.slice(0, maxLen);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

module.exports = {
  parsePositiveIntIdArray,
  normalizeAdminUsername,
  validateAdminUsername,
  normalizeOptionalResumeUrl,
  normalizeRequiredHttpUrl,
  normalizeLeadershipCtaPath,
  normalizeQuoteOptional,
  isValidEmail
};
