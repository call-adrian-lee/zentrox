import { Component, TemplateRef, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TextService } from '../../text/text.service';
import { TextPipe } from '../../text/text.pipe';
import type { PortfolioItem } from '../../models/portfolio.model';

@Component({
  selector: 'app-portfolio-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './portfolio-section.component.html'
})
export class PortfolioSectionComponent {
  private readonly modal = inject(NgbModal);
  private readonly text = inject(TextService);

  readonly previewSrc = signal('');
  readonly previewTitle = signal('');
  readonly previewSubtitle = signal('');
  readonly previewDescription = signal('');
  readonly previewLink = signal('');
  readonly portfolioFilter = signal<'all' | 'web' | 'game'>('all');

  readonly portfolioItems: PortfolioItem[] = [
    {
      category: 'web',
      slug: 'youtopia',
      image: '/img/dev-web-0.JPG',
      title: 'Youtopia',
      subtitle: 'Web Development',
      description:
        'Precision nourishment automation (PNA): AI-matched meals and diagnostics for personalized nutrition and health.',
      link: 'https://www.youtopia.com/'
    },
    {
      category: 'web',
      slug: 'oohyeah',
      image: '/img/dev-web-1.JPG',
      title: 'Oohyeah',
      subtitle: 'Web Development',
      description:
        'Commission-free music platform for artists—sell tracks and merch, fan subscriptions, and built-in marketing tools.',
      link: 'https://oohyeah.app/'
    },
    {
      category: 'web',
      slug: 'howtube',
      image: '/img/dev-web-2.JPG',
      title: 'Howtube',
      subtitle: 'Web Development',
      description:
        'On-demand video platform for conferences, courses, and creator channels—premium education and livestream replays.',
      link: 'https://www.howtube.com/'
    },
    {
      category: 'web',
      slug: 'metronect',
      image: '/img/dev-web-3.JPG',
      title: 'Metronect',
      subtitle: 'Web Development',
      description:
        'Smart building management: tenants, leases, maintenance, packages, SMS/app alerts, and staff tools in one cloud system.',
      link: 'https://www.metronect.com/'
    },
    {
      category: 'web',
      slug: 'kindertales',
      image: '/img/dev-web-4.JPG',
      title: 'Kindertales',
      subtitle: 'Web Development',
      description:
        'Childcare management software—attendance, billing, family messaging, and reporting for centers and multi-site operators.',
      link: 'https://www.kindertales.com/'
    },
    {
      category: 'web',
      slug: 'search4less',
      image: '/img/dev-web-5.JPG',
      title: 'Search4Less',
      subtitle: 'Web Development',
      description:
        'Ireland and UK business intelligence—company, director, and risk data with simple annual pricing for due diligence.',
      link: 'https://search4less.com/'
    },
    {
      category: 'game',
      slug: 'eternal-sword',
      image: '/img/dev-game-0.JPG',
      title: 'Eternal Sword Pact',
      description:
        'Mobile RPG inspired by the Shan Hai Jing—mythic world, familiars, co-op boss raids, and tactical combat.',
      link: 'https://play.google.com/store/apps/details?id=com.mten.tgp&hl=en_US'
    },
    {
      category: 'game',
      slug: 'moba-league',
      image: '/img/dev-game-1.JPG',
      title: 'Moba League: PvP Trainer',
      description:
        'Lightweight 5v5 MOBA for phones—quick matches, ranked play, evolving heroes, and team PvP.',
      link: 'https://play.google.com/store/apps/details?id=com.indiecode.masters&hl=en_IN'
    },
    {
      category: 'game',
      slug: 'wuthering-waves',
      image: '/img/dev-game-2.JPG',
      title: 'Wuthering Waves',
      description:
        'Open-world action RPG—explore Solaris-3, fast combat with Resonators, and story-rich adventure (Kuro Games).',
      link: 'https://play.google.com/store/apps/details?id=com.kurogame.wutheringwaves.global&utm_source=na_Med'
    },
    {
      category: 'game',
      slug: 'hexa-stack',
      image: '/img/dev-game-3.JPG',
      title: 'Hexa Stack: Color Sort Puzzle',
      description:
        'Relaxing hex-tile puzzle—sort and merge colors through thousands of logic levels and seasonal challenges.',
      link: 'https://play.google.com/store/apps/details?id=de.softgames.hexastack&hl=en_US'
    },
    {
      category: 'game',
      slug: 'toy-city',
      image: '/img/dev-game-4.JPG',
      title: 'Toy City: Block Building 3D',
      description:
        'Idle 3D city builder—stack toy blocks, unlock workers, and grow a pocket metropolis at your own pace.',
      link: 'https://play.google.com/store/apps/details?id=toys.blocks.town.bricks&utm_source=na_Med'
    },
    {
      category: 'game',
      slug: 'ar-ruler',
      image: '/img/dev-game-5.JPG',
      title: 'AR Ruler App: Tape Measure Cam',
      description:
        'AR measuring toolkit—distance, angles, area, room plans, and export using your phone camera (ARCore).',
      link: 'https://play.google.com/store/apps/details?id=com.grymala.aruler&hl=en_US'
    }
  ];

  private readonly localizedItems = computed(() => {
    this.text.lang();
    return this.portfolioItems.map((item) => this.localizeItem(item));
  });

  readonly filteredPortfolio = computed(() => {
    const f = this.portfolioFilter();
    return this.localizedItems().filter(
      (i) =>
        f === 'all' || (f === 'web' && i.category === 'web') || (f === 'game' && i.category === 'game')
    );
  });

  private localizeItem(item: PortfolioItem): PortfolioItem {
    const desc = this.text.t(`portfolio.items.${item.slug}.desc`);
    const subtitle = item.subtitle
      ? this.text.t('portfolio.subtitle.web')
      : undefined;
    return { ...item, description: desc, subtitle };
  }

  setPortfolioFilter(f: 'all' | 'web' | 'game'): void {
    this.portfolioFilter.set(f);
  }

  openPreview(tpl: TemplateRef<unknown>, item: PortfolioItem, event: Event): void {
    event.preventDefault();
    this.previewSrc.set(item.image);
    this.previewTitle.set(item.title);
    this.previewSubtitle.set(item.subtitle ?? '');
    this.previewDescription.set(item.description);
    this.previewLink.set(item.link);
    this.modal.open(tpl, {
      centered: true,
      size: 'lg',
      ariaLabelledBy: 'portfolio-preview-title'
    });
  }
}
