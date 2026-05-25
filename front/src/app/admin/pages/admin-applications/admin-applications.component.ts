import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, inject, signal, viewChild } from '@angular/core';
import { AdminApplicationsApiService } from '@admin/services/admin-applications-api.service';
import { AdminNotifyService } from '@admin/services/admin-notify.service';
import type { OpenRoleApplicationRow } from '@shared/models/open-roles.models';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [DatePipe, TextPipe],
  templateUrl: './admin-applications.component.html',
})
export class AdminApplicationsComponent implements OnInit {
  private readonly api = inject(AdminApplicationsApiService);
  private readonly notify = inject(AdminNotifyService);

  readonly rows = signal<OpenRoleApplicationRow[]>([]);
  readonly loadError = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly deleteConfirmInput = viewChild<ElementRef<HTMLInputElement>>('deleteConfirmInput');
  readonly deleteModalOpen = signal(false);
  readonly deleteConfirmText = signal('');
  readonly deleteTarget = signal<OpenRoleApplicationRow | null>(null);
  readonly deleteErrorKey = signal<string | null>(null);
  readonly viewModalOpen = signal(false);
  readonly viewing = signal<OpenRoleApplicationRow | null>(null);

  ngOnInit(): void {
    this.api.listApplications().subscribe({
      next: (r) => this.rows.set(r.applications || []),
      error: () => this.loadError.set(true)
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

  openView(row: OpenRoleApplicationRow): void {
    this.viewing.set(row);
    this.viewModalOpen.set(true);
  }

  closeViewModal(): void {
    this.viewModalOpen.set(false);
    this.viewing.set(null);
  }

  remove(row: OpenRoleApplicationRow): void {
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
    this.api.deleteApplication(row.id).subscribe({
      next: () => {
        this.rows.update((rows) => rows.filter((r) => r.id !== row.id));
        this.deletingId.set(null);
        this.closeDeleteModal();
        this.notify.success('admin.noticeDeleted');
      },
      error: () => {
        this.deletingId.set(null);
        this.deleteErrorKey.set('admin.applicationDeleteError');
        this.notify.error('admin.noticeDeleteFailed');
      }
    });
  }
}
