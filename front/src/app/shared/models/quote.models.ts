/** Public get-a-quote form and admin quotes list (DB table: `project_inquiries`; API: `/api/quotes`). */

export type QuoteServiceType =
  | 'web'
  | 'frontend'
  | 'backend'
  | 'data'
  | 'qa'
  | 'ai'
  | 'game'
  | 'devops'
  | 'custom'
  | 'not_sure';

export type QuoteBudgetRange = 'under_10k' | '10k_50k' | '50k_100k' | 'over_100k' | 'not_sure';

export type QuoteTimeline = 'asap' | '1_3_months' | '3_6_months' | '6_plus_months' | 'flexible';

export type QuoteSource = 'website' | 'social' | 'search' | 'referral' | 'other';

export type QuoteStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export interface QuoteRow {
  id: number;
  full_name: string;
  email: string;
  company: string | null;
  phone: string | null;
  service_type: QuoteServiceType;
  requirements: string;
  budget_range: QuoteBudgetRange;
  timeline: QuoteTimeline | null;
  source: QuoteSource | null;
  status: QuoteStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteSubmitPayload {
  fullName: string;
  email: string;
  company?: string;
  phone?: string;
  serviceType: QuoteServiceType;
  requirements: string;
  budgetRange: QuoteBudgetRange;
  timeline?: QuoteTimeline;
  source?: QuoteSource;
}

export const QUOTE_SERVICE_OPTIONS: QuoteServiceType[] = [
  'web',
  'frontend',
  'backend',
  'data',
  'qa',
  'ai',
  'game',
  'devops',
  'custom',
  'not_sure'
];

export const QUOTE_BUDGET_OPTIONS: QuoteBudgetRange[] = [
  'under_10k',
  '10k_50k',
  '50k_100k',
  'over_100k',
  'not_sure'
];

export const QUOTE_TIMELINE_OPTIONS: QuoteTimeline[] = [
  'asap',
  '1_3_months',
  '3_6_months',
  '6_plus_months',
  'flexible'
];

export const QUOTE_STATUS_OPTIONS: QuoteStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost'];
