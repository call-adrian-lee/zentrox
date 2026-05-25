import type { SeoData } from '@shared/models/seo.models';
import { APP_TEXT } from '@shared/app-copy';

export const userRouteSeo = {
  home: {
    title: APP_TEXT.seo.homeTitle,
    description: APP_TEXT.seo.homeDescription,
    keywords: APP_TEXT.seo.homeKeywords,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    jsonLd: 'organization'
  } satisfies SeoData,
  openRoles: {
    title: APP_TEXT.seo.openRolesTitle,
    description: APP_TEXT.seo.openRolesDescription,
    keywords: APP_TEXT.seo.openRolesKeywords,
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  } satisfies SeoData,
  openRoleApply: {
    title: APP_TEXT.seo.openRoleApplyTitle,
    description: APP_TEXT.seo.openRoleApplyDescription,
    keywords: APP_TEXT.seo.openRoleApplyKeywords,
    robots: 'index, follow'
  } satisfies SeoData,
  getQuote: {
    title: APP_TEXT.seo.getQuoteTitle,
    description: APP_TEXT.seo.getQuoteDescription,
    keywords: APP_TEXT.seo.getQuoteKeywords,
    robots: 'index, follow'
  } satisfies SeoData
};

export const adminRouteSeo = {
  login: {
    title: 'Admin — Sign in',
    description: 'Zentrox staff console.',
    robots: 'noindex, nofollow'
  } satisfies SeoData,
  openRoles: {
    title: 'Admin — Open roles',
    description: 'Manage Zentrox open roles.',
    robots: 'noindex, nofollow'
  } satisfies SeoData,
  leadership: {
    title: 'Admin — Leadership',
    description: 'Manage Zentrox leadership profiles on the public site.',
    robots: 'noindex, nofollow'
  } satisfies SeoData,
  portfolio: {
    title: 'Admin — Portfolio',
    description: 'Manage portfolio tabs and items on the public site.',
    robots: 'noindex, nofollow'
  } satisfies SeoData,
  applications: {
    title: 'Admin — Applications',
    description: 'Review applications submitted through the open roles page.',
    robots: 'noindex, nofollow'
  } satisfies SeoData,
  quotes: {
    title: 'Admin — Quotes',
    description: 'Review quote requests submitted through the public get a quote page.',
    robots: 'noindex, nofollow'
  } satisfies SeoData,
  account: {
    title: 'Admin — Account',
    description: 'Change admin username and password.',
    robots: 'noindex, nofollow'
  } satisfies SeoData
};
