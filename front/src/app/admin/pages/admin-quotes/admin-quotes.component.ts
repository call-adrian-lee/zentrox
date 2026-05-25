import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminQuotesApiService } from '@admin/services/admin-quotes-api.service';
import { AdminNotifyService } from '@admin/services/admin-notify.service';
import { QUOTE_STATUS_OPTIONS, type QuoteRow, type QuoteStatus } from '@shared/models/quote.models';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-admin-quotes',
  standalone: true,
  imports: [DatePipe, FormsModule, TextPipe],
  templateUrl: './admin-quotes.component.html',
})
export class AdminQuotesComponent implements OnInit {
  private readonly api = inject(AdminQuotesApiService);
  private readonly notify = inject(AdminNotifyService);

  readonly statusOptions = QUOTE_STATUS_OPTIONS;
  readonly rows = signal<QuoteRow[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly savingId = signal<number | null>(null);
  readonly deleteConfirmInput = viewChild<ElementRef<HTMLInputElement>>('deleteConfirmInput');
  readonly deleteModalOpen = signal(false);
  readonly deleteConfirmText = signal('');
  readonly deleteTarget = signal<QuoteRow | null>(null);
  readonly deleteErrorKey = signal<string | null>(null);
  readonly viewModalOpen = signal(false);
  readonly viewing = signal<QuoteRow | null>(null);
  readonly editStatus = signal<QuoteStatus>('new');
  readonly editNotes = signal('');

  ngOnInit(): void {
    this.loadRows();
  }

  loadRows(): void {
    this.loading.set(true);
    this.loadError.set(false);
    this.api.listQuotes().subscribe({
      next: (r) => {
        this.rows.set(r.quotes || []);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      }
    });
  }

  @HostListener('document:keydown.escape', ['$event'])
  onDocumentEscape(event: Event): void {
    if (this.deleteModalOpen()) {
      event.preventDefault();
      this.closeDeleteModal();
    } else if (this.viewModalOpen()) {
      event.preventDefault();
      this.closeViewModal();
    }
  }

  openView(row: QuoteRow): void {
    this.viewing.set(row);
    this.editStatus.set(row.status);
    this.editNotes.set(row.admin_notes || '');
    this.viewModalOpen.set(true);
  }

  closeViewModal(): void {
    this.viewModalOpen.set(false);
    this.viewing.set(null);
  }

  saveView(): void {
    const row = this.viewing();
    if (!row) return;
    this.savingId.set(row.id);
    this.api.updateQuote(row.id, { status: this.editStatus(), adminNotes: this.editNotes() }).subscribe({
      next: () => {
        this.savingId.set(null);
        this.notify.success('admin.noticeSaved');
        this.closeViewModal();
        this.loadRows();
      },
      error: () => {
        this.savingId.set(null);
        this.notify.error('admin.noticeSaveFailed');
      }
    });
  }

  remove(row: QuoteRow): void {
    this.deleteErrorKey.set(null);
    this.deleteTarget.set(row);
    this.deleteConfirmText.set('');
    this.deleteModalOpen.set(true);
    queueMicrotask(() => this.deleteConfirmInput()?.nativeElement.focus());
  }

  closeDeleteModal(): void {
    this.deleteErrorKey.set(null);
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

  confirmDelete(): void {
    const row = this.deleteTarget();
    if (!row || !this.canConfirmDelete()) return;
    this.deletingId.set(row.id);
    this.api.deleteQuote(row.id).subscribe({
      next: () => {
        this.rows.update((rows) => rows.filter((r) => r.id !== row.id));
        this.deletingId.set(null);
        this.closeDeleteModal();
        this.notify.success('admin.noticeDeleted');
      },
      error: () => {
        this.deletingId.set(null);
        this.deleteErrorKey.set('admin.quotesDeleteError');
        this.notify.error('admin.noticeDeleteFailed');
      }
    });
  }
}
