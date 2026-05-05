import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { HOME_ROUTE_SEO } from '../app.routes';
import { TextService } from '../text/text.service';
import { ADMIN_BASE_URL } from './admin-paths';
import { COMPANY, COMPANY_ATTRIBUTION } from './company-info';
import type { Job } from './job.models';
import type { SeoData } from './seo.models';

const SITE = 'Zentrox';
const DEFAULT_DESCRIPTION = `SaaS and web platform engineering for ambitious U.S. markets—partnerships with idea owners and investors. Web, APIs, AI, cloud, and Unity. ${COMPANY_ATTRIBUTION}, Austin, TX.`;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly text = inject(TextService);

  /** Path without query/hash, leading slash. */
  apply(path: string, data?: SeoData): void {
    this.text.lang();
    const pathOnly = path.split(/[?#]/)[0] || '/';
    const resolved =
      data ??
      (pathOnly === '/' || pathOnly === '' ? HOME_ROUTE_SEO : undefined);
    const base = this.baseUrl();
    const canonical = `${base}${pathOnly === '/' || pathOnly === '' ? '' : pathOnly}`;

    const isHome = pathOnly === '/' || pathOnly === '';
    const isMvp = pathOnly === '/mvp';
    const isCareers = pathOnly === '/careers';
    const homeWithJsonLd = isHome && resolved?.jsonLd === 'organization';
    let description: string;
    let rawTitle: string;
    if (homeWithJsonLd) {
      description = this.text.t('seo.homeDescription');
      rawTitle = this.text.t('seo.homeTitle');
    } else if (isMvp) {
      description = this.text.t('seo.mvpDescription').trim() || DEFAULT_DESCRIPTION;
      rawTitle = this.text.t('seo.mvpTitle').trim() || SITE;
    } else if (isCareers) {
      description = this.text.t('seo.careersDescription').trim() || DEFAULT_DESCRIPTION;
      rawTitle = this.text.t('seo.careersTitle').trim() || SITE;
    } else {
      description = resolved?.description?.trim() || DEFAULT_DESCRIPTION;
      rawTitle = resolved?.title?.trim() || SITE;
    }

    const robots =
      resolved?.robots ??
      'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    const documentTitle =
      rawTitle === SITE || rawTitle.startsWith(`${SITE} `) || rawTitle.endsWith(`— ${SITE}`)
        ? rawTitle
        : `${rawTitle} | ${SITE}`;

    this.title.setTitle(documentTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ name: 'author', content: COMPANY_ATTRIBUTION });

    const keywords = isHome
      ? this.text.t('seo.homeKeywords').trim()
      : isMvp
        ? this.text.t('seo.mvpKeywords').trim()
        : isCareers
          ? this.text.t('seo.careersKeywords').trim()
          : resolved?.keywords?.trim();
    if (keywords) {
      this.meta.updateTag({ name: 'keywords', content: keywords });
    } else {
      this.meta.removeTag('name=keywords');
    }

    this.setCanonical(canonical);
    this.setOgTwitter({
      title: documentTitle,
      description,
      url: canonical
    });
    this.setOgLocaleTags();
    this.setHreflangAlternates(canonical, pathOnly);

    if (homeWithJsonLd) {
      this.setJsonLd(this.organizationSchema(base));
    } else if (isMvp) {
      this.setJsonLd(this.mvpPageSchema(base, canonical, documentTitle));
    } else if (isCareers) {
      this.setJsonLd(this.careersListingSchema(base, canonical, documentTitle, []));
    } else {
      this.clearJsonLd();
    }
  }

  /**
   * After published jobs load on `/careers`, inject JobPosting nodes for Google Search eligibility.
   * Safe to call with an empty array when there are no listings.
   */
  syncCareersStructuredData(jobs: Job[]): void {
    const base = this.baseUrl();
    const pageUrl = `${base}/careers`;
    const rawTitle = this.text.t('seo.careersTitle').trim() || SITE;
    const documentTitle =
      rawTitle === SITE || rawTitle.startsWith(`${SITE} `) || rawTitle.endsWith(`— ${SITE}`)
        ? rawTitle
        : `${rawTitle} | ${SITE}`;
    this.setJsonLd(this.careersListingSchema(base, pageUrl, documentTitle, jobs));
  }

  private baseUrl(): string {
    const configured = environment.siteUrl?.replace(/\/$/, '').trim();
    if (configured) {
      return configured;
    }
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }

  private setCanonical(href: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setOgTwitter(opts: { title: string; description: string; url: string }): void {
    const base = this.baseUrl();
    const imageUrl = `${base}/img/slider-0.jpg`;
    const imageAlt = this.text.t('seo.ogImageAlt');
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE });
    this.meta.updateTag({ property: 'og:title', content: opts.title });
    this.meta.updateTag({ property: 'og:description', content: opts.description });
    this.meta.updateTag({ property: 'og:url', content: opts.url });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    if (imageUrl.startsWith('https://')) {
      this.meta.updateTag({ property: 'og:image:secure_url', content: imageUrl });
    }
    this.meta.updateTag({ property: 'og:image:alt', content: imageAlt });
    this.meta.updateTag({ property: 'og:image:width', content: '1900' });
    this.meta.updateTag({ property: 'og:image:height', content: '1200' });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: opts.title });
    this.meta.updateTag({ name: 'twitter:description', content: opts.description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:image:alt', content: imageAlt });
  }

  /** Open Graph locale for the single-language site. */
  private setOgLocaleTags(): void {
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });
    this.document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove());
  }

  /** DB-driven MVP cards: avoid a fixed ItemList that could disagree with live `/mvp` content. */
  private mvpPageSchema(base: string, pageUrl: string, documentTitle: string): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: documentTitle,
      description: this.text.t('seo.jsonLdMvpWebPageDescription'),
      isPartOf: { '@id': `${base}/#website` },
      about: { '@id': `${base}/#organization` },
      inLanguage: 'en-US'
    };
  }

  private careersListingSchema(base: string, pageUrl: string, documentTitle: string, jobs: Job[]): object {
    const graph: Record<string, unknown>[] = [
      {
        '@type': 'WebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: documentTitle,
        description: this.text.t('seo.jsonLdCareersWebPageDescription'),
        isPartOf: { '@id': `${base}/#website` },
        about: { '@id': `${base}/#organization` },
        inLanguage: 'en-US'
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: this.text.t('seo.jsonLdCareersBreadcrumbHome'),
            item: `${base}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: this.text.t('seo.jsonLdCareersBreadcrumbCareers'),
            item: pageUrl
          }
        ]
      }
    ];
    for (const job of jobs) {
      if (job.status !== 'published') continue;
      graph.push(this.jobPostingJsonLd(base, job));
    }
    return { '@context': 'https://schema.org', '@graph': graph };
  }

  private jobPostingJsonLd(base: string, job: Job): Record<string, unknown> {
    const applyUrl = `${base}/careers/${job.id}/apply`;
    const desc = this.truncateForJsonLd(job.description || job.title, 50000);
    const datePosted = (job.created_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
    const remote = /\bremote\b/i.test(job.location || '');
    const sameAs = this.organizationSameAsUrls();
    const hiringOrg: Record<string, unknown> = {
      '@type': 'Organization',
      name: COMPANY.name,
      logo: `${base}/img/logo.svg`
    };
    if (sameAs.length) {
      hiringOrg['sameAs'] = sameAs;
    }
    const jp: Record<string, unknown> = {
      '@type': 'JobPosting',
      '@id': `${base}/careers#job-${job.id}`,
      title: job.title,
      description: desc,
      datePosted,
      hiringOrganization: hiringOrg,
      identifier: {
        '@type': 'PropertyValue',
        name: 'zentrox_job_id',
        value: String(job.id)
      },
      url: applyUrl,
      directApply: true,
      employmentType: this.schemaEmploymentType(job.employment_type),
      industry: 'Computer Software',
      applicantLocationRequirements: {
        '@type': 'Country',
        name: 'US'
      },
      inLanguage: 'en-US'
    };
    if (remote) {
      jp['jobLocationType'] = 'TELECOMMUTE';
    } else {
      jp['jobLocation'] = {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          streetAddress: COMPANY.addressLine1,
          addressLocality: COMPANY.addressLocality,
          addressRegion: COMPANY.addressRegion,
          postalCode: COMPANY.postalCode,
          addressCountry: 'US'
        }
      };
    }
    return jp;
  }

  private schemaEmploymentType(raw: string): string {
    const s = (raw || '').toLowerCase();
    if (s.includes('full')) return 'FULL_TIME';
    if (s.includes('part')) return 'PART_TIME';
    if (s.includes('contract') || s.includes('upwork')) return 'CONTRACTOR';
    return 'OTHER';
  }

  private truncateForJsonLd(s: string, max: number): string {
    const t = s.trim();
    return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
  }

  private setHreflangAlternates(canonical: string, pathOnly: string): void {
    if (!canonical || pathOnly === ADMIN_BASE_URL || pathOnly.startsWith(`${ADMIN_BASE_URL}/`)) {
      this.removeHreflangAlternates();
      return;
    }
    this.ensureAlternateLink('en-US', canonical);
    this.ensureAlternateLink('x-default', canonical);
  }

  private removeHreflangAlternates(): void {
    this.document.head
      .querySelectorAll('link[data-zt-hreflang="1"]')
      .forEach((el) => el.remove());
  }

  private ensureAlternateLink(hreflang: string, href: string): void {
    const sel = `link[data-zt-hreflang="1"][hreflang="${hreflang}"]`;
    let link = this.document.querySelector<HTMLLinkElement>(sel);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('data-zt-hreflang', '1');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private organizationSameAsUrls(): string[] {
    const u = COMPANY.linkedinUrl;
    return typeof u === 'string' && u.trim().startsWith('http') ? [u.trim()] : [];
  }

  private organizationSchema(base: string): object {
    const orgDesc = this.text.t('seo.jsonLdOrgDescription');
    const pageDesc = this.text.t('seo.jsonLdWebPageDescription');
    const pageTitle = this.text.t('seo.homeTitle');
    const sameAs = this.organizationSameAsUrls();

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${base}/#organization`,
          name: SITE,
          legalName: COMPANY.name,
          description: orgDesc,
          url: base,
          ...(sameAs.length ? { sameAs } : {}),
          email: COMPANY.email,
          telephone: COMPANY.phoneTel,
          address: {
            '@type': 'PostalAddress',
            streetAddress: COMPANY.addressLine1,
            addressLocality: COMPANY.addressLocality,
            addressRegion: COMPANY.addressRegion,
            postalCode: COMPANY.postalCode,
            addressCountry: 'US'
          },
          areaServed: { '@type': 'Country', name: 'United States' },
          knowsAbout: [
            'SaaS development',
            'Product engineering',
            'Enterprise web applications',
            'Web platform development',
            'API development',
            'Cloud computing',
            'DevOps',
            'Artificial intelligence',
            'Unity development'
          ],
          logo: { '@type': 'ImageObject', url: `${base}/img/logo.svg` },
          image: [`${base}/img/logo.svg`, `${base}/img/slider-0.jpg`]
        },
        {
          '@type': 'WebSite',
          '@id': `${base}/#website`,
          url: base,
          name: SITE,
          publisher: { '@id': `${base}/#organization` },
          inLanguage: 'en-US'
        },
        {
          '@type': 'WebPage',
          '@id': `${base}/#webpage`,
          url: `${base}/`,
          name: pageTitle,
          description: pageDesc,
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          inLanguage: 'en-US'
        }
      ]
    };
  }

  private setJsonLd(data: object): void {
    let el = this.document.getElementById('zentrox-seo-jsonld');
    if (!el) {
      el = this.document.createElement('script');
      el.id = 'zentrox-seo-jsonld';
      el.setAttribute('type', 'application/ld+json');
      this.document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  private clearJsonLd(): void {
    this.document.getElementById('zentrox-seo-jsonld')?.remove();
  }
}
