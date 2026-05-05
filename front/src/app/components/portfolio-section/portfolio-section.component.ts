import { Component, TemplateRef, computed, inject, signal } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TextPipe } from '../../text/text.pipe';
import { PortfolioPublicService } from '../../core/portfolio-public.service';
import type { PortfolioGridItem, PortfolioPublicItemRow, PortfolioPublicTabRow } from '../../models/portfolio.model';

@Component({
  selector: 'app-portfolio-section',
  standalone: true,
  imports: [TextPipe],
  templateUrl: './portfolio-section.component.html'
})
export class PortfolioSectionComponent {
  private readonly modal = inject(NgbModal);
  private readonly portfolioApi = inject(PortfolioPublicService);

  readonly previewSrc = signal('');
  readonly previewTitle = signal('');
  readonly previewSubtitle = signal('');
  readonly previewDescription = signal('');
  readonly previewLink = signal('');
  readonly portfolioTabs = signal<PortfolioPublicTabRow[]>([]);
  readonly portfolioItemsRaw = signal<PortfolioPublicItemRow[]>([]);
  readonly portfolioFilter = signal<'all' | number>('all');
  readonly loadError = signal(false);
  readonly loading = signal(true);

  constructor() {
    this.portfolioApi.listPublished().subscribe({
      next: (r) => {
        const tabs = r.tabs || [];
        const items = r.items || [];
        this.portfolioTabs.set(tabs);
        this.portfolioItemsRaw.set(items);
        const f = this.portfolioFilter();
        if (f !== 'all' && !tabs.some((t) => t.id === f)) {
          this.portfolioFilter.set('all');
        }
        this.loadError.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      }
    });
  }

  /** Published tab ids in display order → first tab uses `web` theme, second `game`. */
  readonly tabKindById = computed(() => {
    const tabs = [...this.portfolioTabs()].sort(
      (a, b) => a.sort_order - b.sort_order || a.id - b.id
    );
    const m = new Map<number, 'web' | 'game' | ''>();
    if (tabs[0]) m.set(tabs[0].id, 'web');
    if (tabs[1]) m.set(tabs[1].id, 'game');
    for (let i = 2; i < tabs.length; i += 1) m.set(tabs[i].id, '');
    return m;
  });

  readonly gridItems = computed<PortfolioGridItem[]>(() => {
    const kinds = this.tabKindById();
    return this.portfolioItemsRaw().map((i) => ({
      id: i.id,
      tabId: i.tab_id,
      portfolioKind: kinds.get(i.tab_id) ?? '',
      image: i.image_path,
      title: i.title,
      subtitle: i.subtitle ?? undefined,
      description: i.description,
      link: i.link_url
    }));
  });

  readonly filteredPortfolio = computed(() => {
    const f = this.portfolioFilter();
    const all = this.gridItems();
    if (f === 'all') return all;
    return all.filter((i) => i.tabId === f);
  });

  setPortfolioFilter(f: 'all' | number): void {
    this.portfolioFilter.set(f);
  }

  openPreview(tpl: TemplateRef<unknown>, item: PortfolioGridItem, event: Event): void {
    event.preventDefault();
    this.previewSrc.set(item.image);
    this.previewTitle.set(item.title);
    this.previewSubtitle.set(item.subtitle ?? '');
    this.previewDescription.set(item.description);
    this.previewLink.set(item.link);
    this.modal.open(tpl, {
      centered: true,
      size: 'lg',
      modalDialogClass: 'zt-portfolio-modal-dialog',
      ariaLabelledBy: 'portfolio-preview-title',
      backdrop: true,
      keyboard: true
    });
  }
}
