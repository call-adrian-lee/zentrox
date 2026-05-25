export type PortfolioPublishStatus = 'draft' | 'published';

export interface PortfolioPublicTabRow {
  id: number;
  title: string;
  sort_order: number;
}

export interface PortfolioPublicItemRow {
  id: number;
  tab_id: number;
  title: string;
  subtitle: string | null;
  description: string;
  image_path: string;
  link_url: string;
  sort_order: number;
}

/** Portfolio grid cell (mapped from API). */
export interface PortfolioGridItem {
  id: number;
  tabId: number;
  portfolioKind: 'web' | 'game' | '';
  image: string;
  title: string;
  subtitle?: string;
  description: string;
  link: string;
}

export interface PortfolioTabAdmin {
  id: number;
  title: string;
  sort_order: number;
  status: PortfolioPublishStatus;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItemAdmin {
  id: number;
  tab_id: number;
  tab_title: string;
  title: string;
  subtitle: string | null;
  description: string;
  image_path: string;
  link_url: string;
  sort_order: number;
  status: PortfolioPublishStatus;
  created_at: string;
  updated_at: string;
}
