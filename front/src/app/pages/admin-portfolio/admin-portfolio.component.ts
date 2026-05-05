import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, ElementRef, HostListener, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminApiService } from '../../core/admin-api.service';
import { AdminNotifyService } from '../../core/admin-notify.service';
import type { PortfolioItemAdmin, PortfolioPublishStatus, PortfolioTabAdmin } from '../../models/portfolio.model';
import { TextPipe } from '../../text/text.pipe';
/** Stable reference for tabs with no items — avoids breaking CDK with a fresh `[]` each CD cycle. */
const EMPTY_PORTFOLIO_TAB_ITEMS: PortfolioItemAdmin[] = [];

@Component({
  selector: 'app-admin-portfolio',
  standalone: true,
  imports: [ReactiveFormsModule, TextPipe, DragDropModule, CdkScrollable],
  templateUrl: './admin-portfolio.component.html'
})
export class AdminPortfolioComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly notify = inject(AdminNotifyService);
  readonly placeholderImagePath = '/img/leadership/placeholder-avatar.svg';

  readonly deleteConfirmInput = viewChild<ElementRef<HTMLInputElement>>('deleteConfirmInput');

  readonly tabs = signal<PortfolioTabAdmin[]>([]);
  readonly items = signal<PortfolioItemAdmin[]>([]);
  readonly loadError = signal(false);
  readonly savingTab = signal(false);
  readonly savingItem = signal(false);
  readonly editingTabId = signal<number | null>(null);
  readonly editingItemId = signal<number | null>(null);
  readonly tabModalOpen = signal(false);
  readonly itemModalOpen = signal(false);
  readonly saveErrorTab = signal<string | null>(null);
  readonly saveErrorItem = signal<string | null>(null);
  readonly reorderTabBusy = signal(false);
  readonly reorderItemBusy = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly deleteConfirmText = signal('');
  readonly deleteTarget = signal<{ kind: 'tab' | 'item'; id: number } | null>(null);
  readonly modalItemImagePreview = signal<string | null>(null);
  readonly portfolioImageUploadBusy = signal(false);
  readonly portfolioImageUploadError = signal<string | null>(null);

  /** Per-tab item lists with stable array references until `items()` changes (required for CDK drop lists). */
  private readonly itemsByTabId = computed(() => {
    const all = this.items();
    const map = new Map<number, PortfolioItemAdmin[]>();
    for (const it of all) {
      let bucket = map.get(it.tab_id);
      if (!bucket) {
        bucket = [];
        map.set(it.tab_id, bucket);
      }
      bucket.push(it);
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) =>
        a.sort_order !== b.sort_order ? a.sort_order - b.sort_order : a.id - b.id
      );
    }
    return map;
  });

  readonly tabForm = this.fb.group({
    title: this.fb.control('', { validators: [Validators.required, Validators.maxLength(128)] }),
    status: this.fb.control<PortfolioPublishStatus>('draft', { validators: [Validators.required] })
  });

  readonly itemForm = this.fb.group({
    tabId: this.fb.control(0, { validators: [Validators.required, Validators.min(1)] }),
    title: this.fb.control('', { validators: [Validators.required, Validators.maxLength(255)] }),
    subtitle: this.fb.control(''),
    description: this.fb.control('', { validators: [Validators.required] }),
    linkUrl: this.fb.control('', { validators: [Validators.required, Validators.maxLength(1024)] }),
    status: this.fb.control<PortfolioPublishStatus>('draft', { validators: [Validators.required] })
  });

  ngOnInit(): void {
    this.reload();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onDocumentEscape(event: Event): void {
    if (this.tabModalOpen()) {
      event.preventDefault();
      this.closeTabModal();
    } else if (this.itemModalOpen()) {
      event.preventDefault();
      this.closeItemModal();
    }
  }

  itemsForTab(tabId: number): PortfolioItemAdmin[] {
    return this.itemsByTabId().get(tabId) ?? EMPTY_PORTFOLIO_TAB_ITEMS;
  }

  reload(): void {
    this.loadError.set(false);
    forkJoin({
      tabList: this.api.listPortfolioTabs(),
      itemList: this.api.listPortfolioItems()
    }).subscribe({
      next: ({ tabList, itemList }) => {
        this.tabs.set(tabList.tabs || []);
        this.items.set(itemList.items || []);
        this.reorderTabBusy.set(false);
        this.reorderItemBusy.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.reorderTabBusy.set(false);
        this.reorderItemBusy.set(false);
        this.notify.error('admin.portfolioLoadError');
      }
    });
  }

  openTabCreate(): void {
    this.saveErrorTab.set(null);
    this.editingTabId.set(null);
    this.tabForm.reset({ title: '', status: 'draft' });
    this.tabModalOpen.set(true);
  }

  startEditTab(t: PortfolioTabAdmin): void {
    this.editingTabId.set(t.id);
    this.tabForm.patchValue({
      title: t.title,
      status: t.status
    });
    this.saveErrorTab.set(null);
    this.tabModalOpen.set(true);
  }

  closeTabModal(): void {
    this.saveErrorTab.set(null);
    this.tabModalOpen.set(false);
    this.editingTabId.set(null);
    this.tabForm.reset({ title: '', status: 'draft' });
  }

  tabModalFormKeydown(ev: KeyboardEvent): void {
    if (ev.key !== 'Enter') return;
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    const tag = t.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    ev.preventDefault();
    this.saveTab();
  }

  saveTab(): void {
    this.saveErrorTab.set(null);
    if (this.tabForm.invalid) {
      this.tabForm.markAllAsTouched();
      this.saveErrorTab.set('admin.formValidationHint');
      return;
    }
    this.savingTab.set(true);
    const v = this.tabForm.getRawValue();
    const id = this.editingTabId();
    const body = {
      title: v.title.trim(),
      status: v.status
    };
    if (id == null) {
      const hadNoTabs = this.tabs().length === 0;
      this.api.createPortfolioTab(body).subscribe({
        next: () => {
          this.closeTabModal();
          this.reload();
          this.savingTab.set(false);
          this.notify.success(hadNoTabs ? 'admin.portfolioFirstTabCreated' : 'admin.noticeSaved');
        },
        error: (err: unknown) => {
          this.savingTab.set(false);
          this.saveErrorTab.set(this.tabErrorFromHttp(err));
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    } else {
      this.api.updatePortfolioTab(id, body).subscribe({
        next: () => {
          this.closeTabModal();
          this.reload();
          this.savingTab.set(false);
          this.notify.success('admin.noticeSaved');
        },
        error: (err: unknown) => {
          this.savingTab.set(false);
          this.saveErrorTab.set(this.tabErrorFromHttp(err));
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    }
  }

  private tabErrorFromHttp(_err: unknown): string {
    return 'admin.portfolioTabSaveError';
  }

  quickSetTabStatus(t: PortfolioTabAdmin, status: PortfolioPublishStatus): void {
    if (t.status === status) return;
    this.api.updatePortfolioTab(t.id, { status }).subscribe({
      next: () => {
        this.reload();
        this.notify.success('admin.noticeStatusUpdated');
      },
      error: () => this.notify.error('admin.noticeStatusFailed')
    });
  }

  dropTab(ev: CdkDragDrop<PortfolioTabAdmin[]>): void {
    if (ev.previousIndex === ev.currentIndex || this.reorderTabBusy()) return;
    const list = [...this.tabs()];
    moveItemInArray(list, ev.previousIndex, ev.currentIndex);
    const ids = list.map((t) => t.id);
    this.reorderTabBusy.set(true);
    this.api.reorderPortfolioTabIds(ids).subscribe({
      next: () => {
        this.reload();
        this.notify.success('admin.noticeReordered');
      },
      error: () => {
        this.reload();
        this.notify.error('admin.noticeReorderFailed');
      }
    });
  }

  removeTab(t: PortfolioTabAdmin): void {
    this.deleteTarget.set({ kind: 'tab', id: t.id });
    this.deleteConfirmText.set('');
    this.deleteModalOpen.set(true);
    queueMicrotask(() => this.deleteConfirmInput()?.nativeElement.focus());
  }

  openItemCreate(): void {
    const first = this.tabs()[0];
    if (!first) {
      this.notify.error('admin.portfolioItemsNeedTab');
      return;
    }
    this.saveErrorItem.set(null);
    this.portfolioImageUploadError.set(null);
    this.editingItemId.set(null);
    this.modalItemImagePreview.set(null);
    this.itemForm.reset({
      tabId: first.id,
      title: '',
      subtitle: '',
      description: '',
      linkUrl: '',
      status: 'draft'
    });
    this.itemModalOpen.set(true);
  }

  startEditItem(it: PortfolioItemAdmin): void {
    this.portfolioImageUploadError.set(null);
    this.editingItemId.set(it.id);
    this.modalItemImagePreview.set(it.image_path || this.placeholderImagePath);
    this.itemForm.patchValue({
      tabId: it.tab_id,
      title: it.title,
      subtitle: it.subtitle ?? '',
      description: it.description,
      linkUrl: it.link_url,
      status: it.status
    });
    this.saveErrorItem.set(null);
    this.itemModalOpen.set(true);
  }

  closeItemModal(): void {
    this.saveErrorItem.set(null);
    this.portfolioImageUploadError.set(null);
    this.portfolioImageUploadBusy.set(false);
    this.itemModalOpen.set(false);
    this.editingItemId.set(null);
    this.modalItemImagePreview.set(null);
    this.itemForm.reset({
      tabId: 0,
      title: '',
      subtitle: '',
      description: '',
      linkUrl: '',
      status: 'draft'
    });
  }

  itemModalFormKeydown(ev: KeyboardEvent): void {
    if (ev.key !== 'Enter') return;
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    const tag = t.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    if (t instanceof HTMLInputElement && t.type === 'file') return;
    ev.preventDefault();
    this.saveItem();
  }

  expectedPortfolioImagePath(id: number | null): string | null {
    if (id == null) return null;
    return `/img/portfolio/portfolio-${id}.png`;
  }

  itemImagePreviewPath(): string {
    return this.modalItemImagePreview() || this.placeholderImagePath;
  }

  saveItem(): void {
    this.saveErrorItem.set(null);
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.saveErrorItem.set('admin.formValidationHint');
      return;
    }
    this.savingItem.set(true);
    const v = this.itemForm.getRawValue();
    const id = this.editingItemId();
    const body = {
      tabId: Number(v.tabId),
      title: v.title.trim(),
      subtitle: v.subtitle.trim() || null,
      description: v.description.trim(),
      linkUrl: v.linkUrl.trim(),
      status: v.status
    };
    if (id == null) {
      this.api.createPortfolioItem(body).subscribe({
        next: () => {
          this.closeItemModal();
          this.reload();
          this.savingItem.set(false);
          this.notify.success('admin.noticeSaved');
        },
        error: (err: unknown) => {
          this.savingItem.set(false);
          this.saveErrorItem.set(this.itemErrorFromHttp(err));
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    } else {
      this.api.updatePortfolioItem(id, body).subscribe({
        next: () => {
          this.closeItemModal();
          this.reload();
          this.savingItem.set(false);
          this.notify.success('admin.noticeSaved');
        },
        error: (err: unknown) => {
          this.savingItem.set(false);
          this.saveErrorItem.set(this.itemErrorFromHttp(err));
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    }
  }

  private itemErrorFromHttp(_err: unknown): string {
    return 'admin.portfolioItemSaveError';
  }

  quickSetItemStatus(it: PortfolioItemAdmin, status: PortfolioPublishStatus): void {
    if (it.status === status) return;
    this.api.updatePortfolioItem(it.id, { status }).subscribe({
      next: () => {
        this.reload();
        this.notify.success('admin.noticeStatusUpdated');
      },
      error: () => this.notify.error('admin.noticeStatusFailed')
    });
  }

  dropPortfolioItem(ev: CdkDragDrop<PortfolioItemAdmin[]>, tabId: number): void {
    if (ev.previousIndex === ev.currentIndex || this.reorderItemBusy()) return;
    const list = [...this.itemsForTab(tabId)];
    moveItemInArray(list, ev.previousIndex, ev.currentIndex);
    const ids = list.map((it) => it.id);
    this.reorderItemBusy.set(true);
    this.api.reorderPortfolioItemIds(tabId, ids).subscribe({
      next: () => {
        this.reload();
        this.notify.success('admin.noticeReordered');
      },
      error: () => {
        this.reload();
        this.notify.error('admin.noticeReorderFailed');
      }
    });
  }

  removeItem(it: PortfolioItemAdmin): void {
    this.deleteTarget.set({ kind: 'item', id: it.id });
    this.deleteConfirmText.set('');
    this.deleteModalOpen.set(true);
    queueMicrotask(() => this.deleteConfirmInput()?.nativeElement.focus());
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.deleteConfirmText.set('');
    this.deleteTarget.set(null);
  }

  onDeleteConfirmInput(v: string): void {
    this.deleteConfirmText.set(v);
  }

  canConfirmDelete(): boolean {
    return this.deleteConfirmText().trim() === 'delete';
  }

  onPortfolioImagePicked(ev: Event): void {
    const id = this.editingItemId();
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || id == null) return;
    this.portfolioImageUploadError.set(null);
    this.portfolioImageUploadBusy.set(true);
    this.api.uploadPortfolioItemImage(id, file).subscribe({
      next: (r) => {
        this.modalItemImagePreview.set(`${r.imagePath}?t=${Date.now()}`);
        this.portfolioImageUploadBusy.set(false);
        this.reload();
        this.notify.success('admin.noticeImageUploaded');
      },
      error: () => {
        this.portfolioImageUploadBusy.set(false);
        this.portfolioImageUploadError.set('admin.portfolioImageUploadError');
        this.notify.error('admin.noticeUploadFailed');
      }
    });
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target || !this.canConfirmDelete()) return;
    if (target.kind === 'tab') {
      this.api.deletePortfolioTab(target.id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.reload();
          this.notify.success('admin.noticeDeleted');
        },
        error: () => this.notify.error('admin.noticeDeleteFailed')
      });
      return;
    }
    this.api.deletePortfolioItem(target.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.reload();
        this.notify.success('admin.noticeDeleted');
      },
      error: () => this.notify.error('admin.noticeDeleteFailed')
    });
  }
}
