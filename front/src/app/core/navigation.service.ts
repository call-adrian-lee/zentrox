import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);

  readonly headerScrolled = signal(false);
  readonly showBackToTop = signal(false);
  readonly mobileNavOpen = signal(false);
  readonly activeSection = signal('home');

  readonly navLinks = [
    { fragment: 'header-carousel', key: 'home' },
    { fragment: 'about', key: 'about' },
    { fragment: 'services', key: 'services' },
    { fragment: 'portfolio', key: 'portfolio' },
    { fragment: 'clients', key: 'clients' },
    { fragment: 'contact', key: 'contact' }
  ] as const;

  onWindowScroll(): void {
    const y = window.scrollY;
    this.headerScrolled.set(y > 100);
    this.showBackToTop.set(y > 100);

    const path = this.router.url.split('?')[0].split('#')[0];
    if (path !== '/' && path !== '') {
      return;
    }

    const offset = 90;
    const pos = y + offset;
    let current = 'home';
    for (const link of this.navLinks) {
      const el = this.doc.getElementById(link.fragment);
      if (el && pos >= el.offsetTop) {
        current = link.key;
      }
    }
    this.activeSection.set(current);
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

  /**
   * Scroll to a home page section. Use for header/footer links instead of routerLink+fragment
   * (same-route fragment navigation does not scroll reliably).
   */
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

  private scrollToFragmentEl(fragment: string): void {
    const el = this.doc.getElementById(fragment);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (fragment === 'contact') {
      setTimeout(() => {
        (this.doc.querySelector('#contact-name') as HTMLInputElement | null)?.focus();
      }, 500);
    }
  }

  scrollTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
