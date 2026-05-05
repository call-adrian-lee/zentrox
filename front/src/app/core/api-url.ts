import { environment } from '../../environments/environment';

/** Build absolute API URL for the current deployment (dev `apiOrigin`, dev proxy, or prod same-origin). */
export function apiUrl(path: string): string {
  const env = environment as { apiBasePath?: string; apiOrigin?: string };
  const base = env.apiBasePath || '/api';
  const p = path.startsWith('/') ? path : `/${path}`;
  const suffix = `${base}${p}`;
  const apiOrigin = env.apiOrigin?.replace(/\/$/, '');
  if (apiOrigin) {
    return `${apiOrigin}${suffix}`;
  }
  if (typeof window === 'undefined') {
    return suffix;
  }
  return `${window.location.origin}${suffix}`;
}
