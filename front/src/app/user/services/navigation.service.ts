import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HOME_NAV_SECTIONS } from '@core/site-nav';
import { prefersReducedMotion } from '@shared/utils/motion';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);

  /** Match `scroll-padding-top` / `[id]` scroll-margin in global styles (~header height + gutter). */
  private static readonly ACTIVE_SECTION_SCROLL_OFFSET = 98;

  readonly headerScrolled = signal(false);
  readonly showBackToTop = signal(false);
  readonly mobileNavOpen = signal(false);
  readonly activeSection = signal('home');

  readonly navLinks = HOME_NAV_SECTIONS;

  private scrollRafId = 0;
  private scrollSyncQueued = false;

  onWindowScroll(): void {
    if (this.scrollRafId) return;
    this.scrollRafId = requestAnimationFrame(() => {
      this.scrollRafId = 0;
      this.queueScrollStateSync();
    });
  }

  /** Initial header/back-to-top state after first paint (avoids NG0100 on load). */
  syncScrollStateAfterRender(): void {
    this.queueScrollStateSync();
  }

  private queueScrollStateSync(): void {
    if (this.scrollSyncQueued) return;
    this.scrollSyncQueued = true;
    queueMicrotask(() => {
      this.scrollSyncQueued = false;
      this.syncScrollState();
    });
  }

  toggleMobileNav(): void {
    const next = !this.mobileNavOpen();
    this.mobileNavOpen.set(next);
    this.doc.body.classList.toggle('mobile-nav-active', next);
  }

  closeMobileNav(): void {
    this.mobileNavOpen.set(false);
    this.doc.body.classList.remove('mobile-nav-active');
  }

  /** Open an internal site route in a new tab (nav CTAs: get a quote, open roles). */
  openSitePageInNewTab(event: Event, path: string): void {
    if (
      event instanceof MouseEvent &&
      (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    ) {
      this.closeMobileNav();
      return;
    }
    event.preventDefault();
    this.closeMobileNav();
    const url = new URL(path, this.doc.baseURI).href;
    const tab = window.open(url, '_blank', 'noopener,noreferrer');
    if (tab) {
      tab.opener = null;
    }
  }

  scrollToHomeSection(event: Event, fragment: string, key: string): void {
    event.preventDefault();
    this.activeSection.set(key);
    this.closeMobileNav();

    const path = this.router.url.split('?')[0].split('#')[0];
    if (path !== '/' && path !== '') {
      void this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollToFragmentEl(fragment), 180);
      });
    } else {
      this.scrollToFragmentEl(fragment);
    }
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }

  private syncScrollState(): void {
    const y = window.scrollY;
    this.headerScrolled.set(y > 100);
    this.showBackToTop.set(y > 100);

    const path = this.router.url.split('?')[0].split('#')[0];
    if (path !== '/' && path !== '') {
      return;
    }

    const pos = y + NavigationService.ACTIVE_SECTION_SCROLL_OFFSET;
    let current = 'home';
    for (const link of this.navLinks) {
      const el = this.doc.getElementById(link.fragment);
      if (el && pos >= el.offsetTop) {
        current = link.key;
      }
    }
    this.activeSection.set(current);
  }

  private scrollToFragmentEl(fragment: string): void {
    const el = this.doc.getElementById(fragment);
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
    el?.scrollIntoView({ behavior, block: 'start' });
    if (fragment === 'contact') {
      setTimeout(() => {
        (this.doc.querySelector('#contact-name') as HTMLInputElement | null)?.focus();
      }, 500);
    }
  }
}
