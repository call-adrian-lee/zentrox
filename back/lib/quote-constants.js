const PROJECT_QUOTE_SERVICE_TYPES = new Set([
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
]);

const PROJECT_QUOTE_BUDGET_RANGES = new Set(['under_10k', '10k_50k', '50k_100k', 'over_100k', 'not_sure']);
const PROJECT_QUOTE_TIMELINES = new Set(['asap', '1_3_months', '3_6_months', '6_plus_months', 'flexible']);
const PROJECT_QUOTE_SOURCES = new Set(['website', 'social', 'search', 'referral', 'other']);
const PROJECT_QUOTE_STATUSES = new Set(['new', 'contacted', 'qualified', 'won', 'lost']);

module.exports = {
  PROJECT_QUOTE_SERVICE_TYPES,
  PROJECT_QUOTE_BUDGET_RANGES,
  PROJECT_QUOTE_TIMELINES,
  PROJECT_QUOTE_SOURCES,
  PROJECT_QUOTE_STATUSES
};
