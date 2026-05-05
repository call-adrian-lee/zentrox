export const environment = {
  production: false,
  /** Empty: use current origin; dev server proxies `/api` to the Node API (see proxy.conf.json). */
  siteUrl: '' as string,
  /** Prefix for REST calls, e.g. `/api/jobs`. */
  apiBasePath: '/api',
  /**
   * Omit `apiOrigin` so URLs are same-origin (`/api/...`). `ng serve` proxies `/api` → backend (proxy.conf.json).
   * Avoids cross-origin failures when using `localhost` vs `127.0.0.1`, another host, or a LAN URL.
   * To bypass the proxy, add `apiOrigin: 'http://127.0.0.1:3000'` and allow that origin in API CORS.
   */
};
