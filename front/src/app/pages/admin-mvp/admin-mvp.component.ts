import { HttpErrorResponse } from '@angular/common/http';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, ElementRef, HostListener, OnInit, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminApiService } from '../../core/admin-api.service';
import { AdminNotifyService } from '../../core/admin-notify.service';
import { MVP_STAGE_OPTIONS } from '../../core/mvp-stage-options';
import type { MvpItem, MvpStatus } from '../../core/mvp.models';
import { TextPipe } from '../../text/text.pipe';

@Component({
  selector: 'app-admin-mvp',
  standalone: true,
  imports: [ReactiveFormsModule, TextPipe, DragDropModule, CdkScrollable],
  templateUrl: './admin-mvp.component.html'
})
export class AdminMvpComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly notify = inject(AdminNotifyService);

  readonly items = signal<MvpItem[]>([]);
  readonly loadError = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly modalOpen = signal(false);
  /** Set when create/update MVP fails (e.g. validation). */
  readonly saveErrorKey = signal<string | null>(null);
  readonly reorderBusy = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly deleteConfirmText = signal('');
  readonly deleteTarget = signal<MvpItem | null>(null);

  readonly mvpStageOptions = [...MVP_STAGE_OPTIONS];
  readonly deleteConfirmInput = viewChild<ElementRef<HTMLInputElement>>('deleteConfirmInput');

  readonly form = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(128)] }),
    focus: this.fb.control('', { validators: [Validators.required] }),
    stage: this.fb.control('Prototyping', { validators: [Validators.required] }),
    status: this.fb.control<MvpStatus>('draft', { validators: [Validators.required] })
  });

  ngOnInit(): void {
    this.reload();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onDocumentEscape(event: Event): void {
    if (!this.modalOpen()) return;
    event.preventDefault();
    this.closeModal();
  }

  reload(): void {
    this.loadError.set(false);
    this.api.listMvp().subscribe({
      next: (r) => {
        this.items.set(r.items || []);
        this.reorderBusy.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.reorderBusy.set(false);
      }
    });
  }

  openCreate(): void {
    this.saveErrorKey.set(null);
    this.resetModalForm();
    this.modalOpen.set(true);
  }

  startEdit(item: MvpItem): void {
    this.editingId.set(item.id);
    this.form.patchValue({
      name: item.name,
      focus: item.focus,
      stage: item.stage,
      status: item.status
    });
    this.saveErrorKey.set(null);
    this.modalOpen.set(true);
  }

  resetModalForm(): void {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      focus: '',
      stage: 'Prototyping',
      status: 'draft'
    });
  }

  closeModal(): void {
    this.saveErrorKey.set(null);
    this.modalOpen.set(false);
    this.resetModalForm();
  }

  modalFormKeydown(ev: KeyboardEvent): void {
    if (ev.key !== 'Enter') return;
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    const tag = t.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    ev.preventDefault();
    this.save();
  }

  save(): void {
    this.saveErrorKey.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveErrorKey.set('admin.formValidationHint');
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const id = this.editingId();
    const body = {
      name: v.name.trim(),
      focus: v.focus.trim(),
      stage: v.stage,
      status: v.status
    };
    if (id == null) {
      this.api.createMvp(body).subscribe({
        next: () => {
          this.closeModal();
          this.reload();
          this.saving.set(false);
          this.notify.success('admin.noticeSaved');
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.saveErrorKey.set(this.mvpSaveErrorFromHttp(err));
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    } else {
      this.api.updateMvp(id, body).subscribe({
        next: () => {
          this.closeModal();
          this.reload();
          this.saving.set(false);
          this.notify.success('admin.noticeSaved');
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.saveErrorKey.set(this.mvpSaveErrorFromHttp(err));
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    }
  }

  stageSelectOptions(): string[] {
    const id = this.editingId();
    const item = id != null ? this.items().find((i) => i.id === id) : null;
    const set = new Set<string>(this.mvpStageOptions);
    if (item?.stage) set.add(item.stage);
    return Array.from(set);
  }

  private mvpSaveErrorFromHttp(err: unknown): string {
    if (err instanceof HttpErrorResponse && err.status === 400) {
      const msg = typeof err.error?.error === 'string' ? err.error.error : '';
      if (msg.includes('stage')) return 'admin.mvpStageInvalid';
    }
    return 'admin.mvpSaveError';
  }

  quickSetStatus(item: MvpItem, status: MvpStatus): void {
    if (item.status === status) return;
    this.api.updateMvp(item.id, { status }).subscribe({
      next: () => {
        this.reload();
        this.notify.success('admin.noticeStatusUpdated');
      },
      error: () => this.notify.error('admin.noticeStatusFailed')
    });
  }

  dropMvp(ev: CdkDragDrop<MvpItem[]>): void {
    if (ev.previousIndex === ev.currentIndex || this.reorderBusy()) return;
    const list = [...this.items()];
    moveItemInArray(list, ev.previousIndex, ev.currentIndex);
    const ids = list.map((it) => it.id);
    this.reorderBusy.set(true);
    this.api.reorderMvpIds(ids).subscribe({
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

  remove(item: MvpItem): void {
    this.deleteTarget.set(item);
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

  confirmDelete(): void {
    const item = this.deleteTarget();
    if (!item || !this.canConfirmDelete()) return;
    this.api.deleteMvp(item.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.reload();
        this.notify.success('admin.noticeDeleted');
      },
      error: () => this.notify.error('admin.noticeDeleteFailed')
    });
  }
}
