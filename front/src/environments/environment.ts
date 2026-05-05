export const environment = {
  production: true,
  /**
   * Canonical / Open Graph / JSON-LD base URL (no trailing slash).
   * Set to '' only if you need localhost-relative URLs during development.
   */
  siteUrl: 'https://zentrox.us' as string,
  /** Production: same-origin `/api` (reverse-proxy to Node). */
  apiBasePath: '/api'
};
