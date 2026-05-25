/** Canonical nav keys, scroll targets, and public routes — keep in sync with `nav` copy in app-copy.ts. */

export const HOME_SECTION_HOME = 'home';
export const HOME_SECTION_ABOUT = 'about';
export const HOME_SECTION_LEADERSHIP = 'leadership';
export const HOME_SECTION_SERVICES = 'services';
export const HOME_SECTION_PORTFOLIO = 'portfolio';
export const HOME_SECTION_TESTIMONIALS = 'testimonials';
export const HOME_SECTION_CONTACT = 'contact';

export type HomeSectionKey =
  | typeof HOME_SECTION_HOME
  | typeof HOME_SECTION_ABOUT
  | typeof HOME_SECTION_LEADERSHIP
  | typeof HOME_SECTION_SERVICES
  | typeof HOME_SECTION_PORTFOLIO
  | typeof HOME_SECTION_TESTIMONIALS
  | typeof HOME_SECTION_CONTACT;

export const HOME_NAV_SECTIONS: ReadonlyArray<{ fragment: string; key: HomeSectionKey }> = [
  { fragment: HOME_SECTION_HOME, key: HOME_SECTION_HOME },
  { fragment: HOME_SECTION_ABOUT, key: HOME_SECTION_ABOUT },
  { fragment: HOME_SECTION_LEADERSHIP, key: HOME_SECTION_LEADERSHIP },
  { fragment: HOME_SECTION_SERVICES, key: HOME_SECTION_SERVICES },
  { fragment: HOME_SECTION_PORTFOLIO, key: HOME_SECTION_PORTFOLIO },
  { fragment: HOME_SECTION_TESTIMONIALS, key: HOME_SECTION_TESTIMONIALS },
  { fragment: HOME_SECTION_CONTACT, key: HOME_SECTION_CONTACT }
];

export const ROUTE_GET_QUOTE = '/get-quote';
export const ROUTE_OPEN_ROLES = '/open-roles';
export const OPEN_ROLE_APPLY_SEGMENT = 'apply';

/** Anchor attrs for CTAs that open in a new tab (use with `href`, not `routerLink`). */
export const OPEN_IN_NEW_TAB = {
  target: '_blank',
  rel: 'noopener noreferrer'
} as const;

/** Router link tuple for `/open-roles/:roleId/apply`. */
export function openRoleApplyLink(roleId: number | string): readonly [string, number | string, string] {
  return [ROUTE_OPEN_ROLES, roleId, OPEN_ROLE_APPLY_SEGMENT] as const;
}

/** Same destination as `openRoleApplyLink`, for `href` + new-tab links. */
export function openRoleApplyHref(roleId: number | string): string {
  return `${ROUTE_OPEN_ROLES}/${roleId}/${OPEN_ROLE_APPLY_SEGMENT}`;
}

/** Legacy paths → redirect in app.routes.ts */
export const LEGACY_ROUTE_START = '/start';
export const LEGACY_ROUTE_CAREERS = '/careers';
export const LEGACY_ROUTE_JOBS = '/jobs';

export function isQuotePagePath(path: string): boolean {
  return path === ROUTE_GET_QUOTE || path === LEGACY_ROUTE_START;
}

export function isOpenRolesPath(path: string): boolean {
  return (
    path === ROUTE_OPEN_ROLES ||
    path === LEGACY_ROUTE_CAREERS ||
    path === LEGACY_ROUTE_JOBS ||
    path.startsWith(`${LEGACY_ROUTE_CAREERS}/`) ||
    path.startsWith(`${LEGACY_ROUTE_JOBS}/`)
  );
}

export function isOpenRolesListingPath(path: string): boolean {
  return path === ROUTE_OPEN_ROLES || path === LEGACY_ROUTE_CAREERS || path === LEGACY_ROUTE_JOBS;
}
