/** Public-facing company details */
export const COMPANY = {
  legalName: 'Zentrox LLC',
  tagline: 'Software & IT services for U.S. businesses',
  addressLine1: '1005 N Congress Ave',
  addressLocality: 'Austin',
  addressRegion: 'TX',
  postalCode: '78701',
  cityStateZip: 'Austin, TX 78701',
  country: 'USA',
  phoneDisplay: '+1 (512) 812-7060',
  phoneTel: '+15128127060',
  businessHours: 'Mon–Fri · 9:00 a.m. – 6:00 p.m. CT',
  responseSla: 'We reply within one business day.',
  email: 'contact@zentrox.us',
  /** Replace with your real company page when ready */
  linkedinUrl: 'https://www.linkedin.com/company/zentrox-us',
  /**
   * Slack “Copy invite link” URL. If empty, the footer still shows Slack but uses
   * `slackFooterFallbackHref` until you paste your real invite link here.
   */
  slackJoinUrl: '',
  /** Shown in footer when `slackJoinUrl` is empty */
  slackFooterFallbackHref: 'https://slack.com'
} as const;
