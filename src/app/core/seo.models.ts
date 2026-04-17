/** Per-route SEO; applied on navigation (SPA). */
export interface SeoData {
  /** Short page title (suffix " | Zentrox" is added unless title is the site name only). */
  title: string;
  description: string;
  /** Defaults to index,follow for public pages. */
  robots?: string;
  keywords?: string;
  /** If true, inject Organization + WebSite JSON-LD (home). */
  jsonLd?: 'organization';
}
