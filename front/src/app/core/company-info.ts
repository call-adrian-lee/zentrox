/** Public-facing company details */
export const COMPANY = {
  /** Brand and organization name */
  name: 'Zentrox',
  tagline: 'Software & IT services for U.S. businesses',
  /** Replace with your real company page when ready */
  linkedinUrl: 'https://www.linkedin.com/company/zentrox-us',
  /**
   * Slack “Copy invite link” URL. If empty, the footer still shows Slack but uses
   * `slackFooterFallbackHref` until you paste your real invite link here.
   */
  slackJoinUrl:
    'https://join.slack.com/t/zentrox-us/shared_invite/zt-3z4p6ept3-gKlWWPXGVpS8L8ArhngLbw',
  /** Shown in footer when `slackJoinUrl` is empty */
  slackFooterFallbackHref: 'https://slack.com'
} as const;

/** Name for meta tags, copyright, and running prose */
export const COMPANY_ATTRIBUTION = COMPANY.name;
