import type { QuoteBudgetRange, QuoteServiceType, QuoteTimeline } from '@shared/models/quote.models';

export const EMPTY_QUOTE_FORM = {
  fullName: '',
  email: '',
  company: '',
  phone: '',
  serviceType: '' as QuoteServiceType | '',
  requirements: '',
  budgetRange: '' as QuoteBudgetRange | '',
  timeline: '' as QuoteTimeline | ''
};

export function resolveQuoteSubmitErrorKey(err: unknown): string {
  if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 0) {
    return 'getQuote.submitError';
  }
  if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 503) {
    return 'getQuote.submitUnavailable';
  }
  if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 429) {
    return 'getQuote.submitRateLimit';
  }
  if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 400) {
    return 'getQuote.submitValidationError';
  }
  return 'getQuote.submitError';
}
