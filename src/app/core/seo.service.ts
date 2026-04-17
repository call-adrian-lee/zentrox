import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { HOME_ROUTE_SEO } from '../app.routes';
import { I18nService } from '../i18n/i18n.service';
import type { AppLang } from '../i18n/i18n.types';
import { COMPANY } from './company-info';
import type { SeoData } from './seo.models';

const SITE = 'Zentrox';
const DEFAULT_DESCRIPTION =
  'SaaS and web platform engineering for ambitious U.S. markets—partnerships with idea owners and investors. Web, APIs, AI, cloud, and Unity. Zentrox LLC, Austin, TX.';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly i18n = inject(I18nService);

  /** Path without query/hash, leading slash. */
  apply(path: string, data?: SeoData): void {
    this.i18n.lang();
    const pathOnly = path.split(/[?#]/)[0] || '/';
    const resolved =
      data ??
      (pathOnly === '/' || pathOnly === '' ? HOME_ROUTE_SEO : undefined);
    const base = this.baseUrl();
    const canonical = `${base}${pathOnly === '/' || pathOnly === '' ? '' : pathOnly}`;

    const isHome = pathOnly === '/' || pathOnly === '';
    const isMvp = pathOnly === '/mvp';
    const homeWithJsonLd = isHome && resolved?.jsonLd === 'organization';

    let description: string;
    let rawTitle: string;
    if (homeWithJsonLd) {
      description = this.i18n.t('seo.homeDescription');
      rawTitle = this.i18n.t('seo.homeTitle');
    } else if (isMvp) {
      description = this.i18n.t('seo.mvpDescription').trim() || DEFAULT_DESCRIPTION;
      rawTitle = this.i18n.t('seo.mvpTitle').trim() || SITE;
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
    this.meta.updateTag({ name: 'author', content: COMPANY.legalName });

    const keywords = isHome
      ? this.i18n.t('seo.homeKeywords').trim()
      : isMvp
        ? this.i18n.t('seo.mvpKeywords').trim()
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
    this.setHreflangAlternates(base, pathOnly);

    if (homeWithJsonLd) {
      this.setJsonLd(this.organizationSchema(base));
    } else if (isMvp) {
      this.setJsonLd(this.mvpPageSchema(base, canonical, documentTitle));
    } else {
      this.clearJsonLd();
    }
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
    const imageAlt = this.i18n.t('seo.ogImageAlt');
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

  /** Open Graph locale + alternates for ES / EN / Chinese (helps social previews). */
  private setOgLocaleTags(): void {
    const lang = this.i18n.lang();
    const primary = ((): string => {
      switch (lang) {
        case 'es':
          return 'es_ES';
        case 'zh':
          return 'zh_CN';
        default:
          return 'en_US';
      }
    })();
    this.meta.updateTag({ property: 'og:locale', content: primary });
    this.document.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove());
    for (const code of ['en_US', 'es_ES', 'zh_CN'] as const) {
      if (code === primary) {
        continue;
      }
      const m = this.document.createElement('meta');
      m.setAttribute('property', 'og:locale:alternate');
      m.setAttribute('content', code);
      this.document.head.appendChild(m);
    }
  }

  /** hreflang alternates use `?hl=` so each locale has a stable URL for crawlers. */
  private setHreflangAlternates(base: string, pathOnly: string): void {
    if (!base) {
      return;
    }
    this.document.head.querySelectorAll('link[data-zt-hreflang]').forEach((el) => el.remove());
    const path = pathOnly === '/' || pathOnly === '' ? '/' : pathOnly;
    const origin = base.endsWith('/') ? base.slice(0, -1) : base;
    const withHl = (hl: AppLang): string => {
      const u = new URL(path, `${origin}/`);
      u.searchParams.set('hl', hl);
      return u.toString();
    };
    const pairs: [string, string][] = [
      ['en', withHl('en')],
      ['es', withHl('es')],
      ['zh-Hans', withHl('zh')],
      ['x-default', withHl('en')]
    ];
    for (const [hreflang, href] of pairs) {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      link.setAttribute('data-zt-hreflang', '');
      this.document.head.appendChild(link);
    }
  }

  private mvpPageSchema(base: string, pageUrl: string, documentTitle: string): object {
    const itemSlugs = ['hireflowLite', 'clientPulse', 'sprintBoardAi', 'opsDeskMini'] as const;
    const pageLang = ((): string => {
      switch (this.i18n.lang()) {
        case 'es':
          return 'es';
        case 'zh':
          return 'zh-Hans';
        default:
          return 'en-US';
      }
    })();
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: documentTitle,
      description: this.i18n.t('seo.jsonLdMvpWebPageDescription'),
      isPartOf: { '@id': `${base}/#website` },
      about: { '@id': `${base}/#organization` },
      inLanguage: pageLang,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: itemSlugs.length,
        itemListElement: itemSlugs.map((slug, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'CreativeWork',
            name: this.i18n.t(`mvp.items.${slug}.name`),
            description: this.i18n.t(`mvp.items.${slug}.focus`)
          }
        }))
      }
    };
  }

  private organizationSchema(base: string): object {
    const orgDesc = this.i18n.t('seo.jsonLdOrgDescription');
    const pageDesc = this.i18n.t('seo.jsonLdWebPageDescription');
    const pageTitle = this.i18n.t('seo.homeTitle');
    const pageLang = ((): string => {
      switch (this.i18n.lang()) {
        case 'es':
          return 'es';
        case 'zh':
          return 'zh-Hans';
        default:
          return 'en-US';
      }
    })();

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${base}/#organization`,
          name: SITE,
          legalName: COMPANY.legalName,
          description: orgDesc,
          url: base,
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
          inLanguage: ['en-US', 'es', 'zh-Hans']
        },
        {
          '@type': 'WebPage',
          '@id': `${base}/#webpage`,
          url: `${base}/`,
          name: pageTitle,
          description: pageDesc,
          isPartOf: { '@id': `${base}/#website` },
          about: { '@id': `${base}/#organization` },
          inLanguage: pageLang
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
