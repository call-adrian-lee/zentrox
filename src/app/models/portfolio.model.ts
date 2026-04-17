export type PortfolioCategory = 'web' | 'game';

export interface PortfolioItem {
  category: PortfolioCategory;
  /** Stable key for i18n (`portfolio.items.<slug>.desc`) */
  slug: string;
  image: string;
  title: string;
  /** Short summary from the live product site or store listing */
  description: string;
  subtitle?: string;
  link: string;
}
