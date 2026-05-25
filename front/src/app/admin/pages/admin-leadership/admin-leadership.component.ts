import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, ElementRef, HostListener, OnInit, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminLeadershipApiService } from '@admin/services/admin-leadership-api.service';
import { AdminNotifyService } from '@admin/services/admin-notify.service';
import type { LeadershipMember, PublishStatus } from '@shared/models/leadership.models';
import { TextPipe } from '@shared/pipes/text.pipe';
import { SITE_IMAGES, leadershipPhotoPath } from '@core/site-images';
@Component({
  selector: 'app-admin-leadership',
  standalone: true,
  imports: [ReactiveFormsModule, TextPipe, DragDropModule, CdkScrollable],
  templateUrl: './admin-leadership.component.html',
})
export class AdminLeadershipComponent implements OnInit {
  private readonly api = inject(AdminLeadershipApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly notify = inject(AdminNotifyService);
  readonly placeholderAvatarPath = SITE_IMAGES.leadershipPlaceholder;

  readonly deleteConfirmInput = viewChild<ElementRef<HTMLInputElement>>('deleteConfirmInput');

  readonly members = signal<LeadershipMember[]>([]);
  readonly loadError = signal(false);
  readonly saving = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly modalOpen = signal(false);
  readonly saveErrorKey = signal<string | null>(null);
  readonly reorderBusy = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly deleteConfirmText = signal('');
  readonly deleteTarget = signal<LeadershipMember | null>(null);
  readonly modalPhotoPathOverride = signal<string | null>(null);

  readonly form = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(128)] }),
    roleTitle: this.fb.control('', { validators: [Validators.required, Validators.maxLength(255)] }),
    blurb: this.fb.control('', { validators: [Validators.required] }),
    status: this.fb.control<PublishStatus>('draft', { validators: [Validators.required] })
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
    this.api.listLeadership().subscribe({
      next: (r) => {
        this.members.set(r.members || []);
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

  startEdit(m: LeadershipMember): void {
    this.editingId.set(m.id);
    this.modalPhotoPathOverride.set(m.photo_path || this.placeholderAvatarPath);
    this.form.patchValue({
      name: m.name,
      roleTitle: m.role_title,
      blurb: m.blurb,
      status: m.status
    });
    this.saveErrorKey.set(null);
    this.modalOpen.set(true);
  }

  /** Clears draft state when opening create or after closing the modal (not the same as dismiss-only). */
  resetModalForm(): void {
    this.editingId.set(null);
    this.modalPhotoPathOverride.set(null);
    this.form.reset({
      name: '',
      roleTitle: '',
      blurb: '',
      status: 'draft'
    });
  }

  closeModal(): void {
    this.saveErrorKey.set(null);
    this.modalOpen.set(false);
    this.resetModalForm();
  }

  /** Enter in modal fields submits; excludes textarea/select; primary button uses click (does not rely on `ngSubmit`). */
  modalFormKeydown(ev: KeyboardEvent): void {
    if (ev.key !== 'Enter') return;
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    const tag = t.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    ev.preventDefault();
    this.save();
  }

  expectedLeadershipPhotoPath(id: number | null): string | null {
    if (id == null) return null;
    return leadershipPhotoPath(id);
  }

  modalLeadershipIdLabel(): string {
    const id = this.editingId();
    return id == null ? 'Will be assigned after first save' : String(id);
  }

  memberPhotoPath(m: LeadershipMember): string {
    return m.photo_path || this.placeholderAvatarPath;
  }

  modalPreviewPath(): string {
    return this.modalPhotoPathOverride() || this.placeholderAvatarPath;
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
      roleTitle: v.roleTitle.trim(),
      blurb: v.blurb.trim(),
      badgeLabel: null,
      cardAria: null,
      ctaLabel: null,
      ctaAria: null,
      ctaPath: null,
      openSeat: false,
      status: v.status
    };
    if (id == null) {
      this.api.createLeadership(body).subscribe({
        next: () => {
          this.closeModal();
          this.reload();
          this.saving.set(false);
          this.notify.success('admin.noticeSaved');
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.saveErrorKey.set(this.saveErrorFromHttp(err));
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    } else {
      this.api.updateLeadership(id, body).subscribe({
        next: () => {
          this.closeModal();
          this.reload();
          this.saving.set(false);
          this.notify.success('admin.noticeSaved');
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.saveErrorKey.set(this.saveErrorFromHttp(err));
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    }
  }

  private saveErrorFromHttp(_err: unknown): string {
    return 'admin.leadershipSaveError';
  }

  quickSetStatus(m: LeadershipMember, status: PublishStatus): void {
    if (m.status === status) return;
    this.api.updateLeadership(m.id, { status }).subscribe({
      next: () => {
        this.reload();
        this.notify.success('admin.noticeStatusUpdated');
      },
      error: () => this.notify.error('admin.noticeStatusFailed')
    });
  }

  dropLeadership(ev: CdkDragDrop<LeadershipMember[]>): void {
    if (ev.previousIndex === ev.currentIndex || this.reorderBusy()) return;
    const list = [...this.members()];
    moveItemInArray(list, ev.previousIndex, ev.currentIndex);
    const ids = list.map((m) => m.id);
    this.reorderBusy.set(true);
    this.api.reorderLeadershipIds(ids).subscribe({
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

  remove(m: LeadershipMember): void {
    this.deleteTarget.set(m);
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
    const m = this.deleteTarget();
    if (!m || !this.canConfirmDelete()) return;
    this.api.deleteLeadership(m.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.reload();
        this.notify.success('admin.noticeDeleted');
      },
      error: () => this.notify.error('admin.noticeDeleteFailed')
    });
  }

  onAdminThumbError(ev: Event): void {
    const img = ev.target as HTMLImageElement | null;
    if (!img) return;
    if (img.src.includes(this.placeholderAvatarPath)) return;
    img.src = this.placeholderAvatarPath;
  }
}
