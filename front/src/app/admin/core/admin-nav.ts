import {
  ADMIN_BASE_URL,
  ADMIN_ROUTE_ACCOUNT,
  ADMIN_ROUTE_APPLICATIONS,
  ADMIN_ROUTE_LEADERSHIP,
  ADMIN_ROUTE_OPEN_ROLES,
  ADMIN_ROUTE_PORTFOLIO,
  ADMIN_ROUTE_QUOTES
} from '@admin/core/admin-paths';

export interface AdminNavLink {
  routerLink: string;
  labelKey: string;
}

/** Sidebar groups in display order (site content → leads/hiring → account). */
export interface AdminNavGroup {
  links: AdminNavLink[];
  dividerAfter: boolean;
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    links: [
      { routerLink: `${ADMIN_BASE_URL}/${ADMIN_ROUTE_LEADERSHIP}`, labelKey: 'admin.navLeadership' },
      { routerLink: `${ADMIN_BASE_URL}/${ADMIN_ROUTE_PORTFOLIO}`, labelKey: 'admin.navPortfolio' }
    ],
    dividerAfter: true
  },
  {
    links: [
      { routerLink: `${ADMIN_BASE_URL}/${ADMIN_ROUTE_QUOTES}`, labelKey: 'admin.navQuotes' },
      { routerLink: `${ADMIN_BASE_URL}/${ADMIN_ROUTE_OPEN_ROLES}`, labelKey: 'admin.navOpenRoles' },
      { routerLink: `${ADMIN_BASE_URL}/${ADMIN_ROUTE_APPLICATIONS}`, labelKey: 'admin.navApplications' }
    ],
    dividerAfter: true
  },
  {
    links: [{ routerLink: `${ADMIN_BASE_URL}/${ADMIN_ROUTE_ACCOUNT}`, labelKey: 'admin.navAccount' }],
    dividerAfter: true
  }
];

export function isAdminSidebarRoute(url: string): boolean {
  const path = url.split('?')[0].split('#')[0];
  return ADMIN_NAV_GROUPS.some((group) => group.links.some((link) => path.includes(link.routerLink)));
}
