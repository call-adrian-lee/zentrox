import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  afterNextRender,
  inject,
  Injector,
  runInInjectionContext,
  signal,
  viewChild
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminOpenRolesApiService } from '@admin/services/admin-open-roles-api.service';
import { AdminNotifyService } from '@admin/services/admin-notify.service';
import { escapeHtml } from '@shared/html-content';
import type { OpenRole, OpenRoleStatus } from '@shared/models/open-roles.models';
import { TextPipe } from '@shared/pipes/text.pipe';

@Component({
  selector: 'app-admin-open-roles',
  standalone: true,
  imports: [ReactiveFormsModule, TextPipe],
  templateUrl: './admin-open-roles.component.html',
})
export class AdminOpenRolesComponent implements OnInit {
  private readonly api = inject(AdminOpenRolesApiService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly notify = inject(AdminNotifyService);
  private readonly injector = inject(Injector);

  readonly roles = signal<OpenRole[]>([]);
  readonly loadError = signal(false);
  readonly saving = signal(false);
  readonly saveErrorKey = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly modalOpen = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly deleteConfirmText = signal('');
  readonly deleteTarget = signal<OpenRole | null>(null);
  readonly employmentTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Commission',
    'Equity Partnership',
    'Internship',
    'Freelance',
    'Temporary'
  ] as const;
  readonly deleteConfirmInput = viewChild<ElementRef<HTMLInputElement>>('deleteConfirmInput');
  readonly descriptionEditor = viewChild<ElementRef<HTMLDivElement>>('descriptionEditor');

  readonly form = this.fb.group({
    title: this.fb.control('', { validators: [Validators.required, Validators.maxLength(255)] }),
    description: this.fb.control('', { validators: [Validators.required] }),
    location: this.fb.control(''),
    employmentType: this.fb.control('Full-time'),
    status: this.fb.control<OpenRoleStatus>('draft', { validators: [Validators.required] })
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
    this.api.listOpenRoles().subscribe({
      next: (r) => this.roles.set(r.roles || []),
      error: () => this.loadError.set(true)
    });
  }

  openCreate(): void {
    this.saveErrorKey.set(null);
    this.resetModalForm();
    this.modalOpen.set(true);
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => this.bootstrapDescriptionEditor(''));
    });
  }

  startEdit(role: OpenRole): void {
    this.saveErrorKey.set(null);
    this.editingId.set(role.id);
    this.form.patchValue({
      title: role.title,
      description: role.description,
      location: role.location,
      employmentType: role.employment_type,
      status: role.status
    });
    this.modalOpen.set(true);
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => this.bootstrapDescriptionEditor(role.description));
    });
  }

  resetModalForm(): void {
    this.editingId.set(null);
    this.form.reset({
      title: '',
      description: '',
      location: '',
      employmentType: 'Full-time',
      status: 'draft'
    });
    const el = this.descriptionEditorEl();
    if (el) el.innerHTML = '';
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
    if (t.isContentEditable) return;
    const tag = t.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
    ev.preventDefault();
    this.save();
  }

  openDeleteModal(role: OpenRole): void {
    this.deleteTarget.set(role);
    this.deleteConfirmText.set('');
    this.deleteModalOpen.set(true);
    queueMicrotask(() => this.deleteConfirmInput()?.nativeElement.focus());
  }

  closeDeleteModal(): void {
    this.deleteModalOpen.set(false);
    this.deleteTarget.set(null);
    this.deleteConfirmText.set('');
  }

  onDeleteConfirmInput(v: string): void {
    this.deleteConfirmText.set(v);
  }

  canConfirmDelete(): boolean {
    return this.deleteConfirmText().trim() === 'delete';
  }

  save(): void {
    this.saveErrorKey.set(null);
    this.flushDescriptionControlFromEditor();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.saveErrorKey.set('admin.formValidationHint');
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const id = this.editingId();
    const body = {
      title: v.title.trim(),
      description: v.description.trim(),
      location: v.location.trim(),
      employmentType: v.employmentType.trim() || 'Full-time',
      status: v.status
    };
    if (id == null) {
      this.api.createOpenRole(body).subscribe({
        next: () => {
          this.closeModal();
          this.reload();
          this.saving.set(false);
          this.notify.success('admin.noticeSaved');
        },
        error: () => {
          this.saving.set(false);
          this.saveErrorKey.set('admin.openRolesSaveError');
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    } else {
      this.api.updateOpenRole(id, body).subscribe({
        next: () => {
          this.closeModal();
          this.reload();
          this.saving.set(false);
          this.notify.success('admin.noticeSaved');
        },
        error: () => {
          this.saving.set(false);
          this.saveErrorKey.set('admin.openRolesSaveError');
          this.notify.error('admin.noticeSaveFailed');
        }
      });
    }
  }

  quickSetStatus(role: OpenRole, status: OpenRoleStatus): void {
    if (role.status === status) return;
    this.api.updateOpenRole(role.id, { status }).subscribe({
      next: () => {
        this.reload();
        this.notify.success('admin.noticeStatusUpdated');
      },
      error: () => this.notify.error('admin.noticeStatusFailed')
    });
  }

  remove(role: OpenRole): void {
    this.openDeleteModal(role);
  }

  confirmDelete(): void {
    const role = this.deleteTarget();
    if (!role || !this.canConfirmDelete()) return;
    this.api.deleteOpenRole(role.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.reload();
        this.notify.success('admin.noticeDeleted');
      },
      error: () => this.notify.error('admin.noticeDeleteFailed')
    });
  }

  onDescriptionInput(): void {
    this.syncDescriptionFromEditor(true);
  }

  applyDescriptionFormat(command: 'bold' | 'italic' | 'insertUnorderedList' | 'insertOrderedList'): void {
    this.focusDescriptionEditor();
    document.execCommand(command, false);
    this.syncDescriptionFromEditor(true);
  }

  applyDescriptionBlock(tag: 'p' | 'h3' | 'h4'): void {
    this.focusDescriptionEditor();
    document.execCommand('formatBlock', false, tag);
    this.syncDescriptionFromEditor(true);
  }

  applyDescriptionLink(): void {
    this.focusDescriptionEditor();
    const raw = window.prompt('Enter URL (https://...)');
    if (!raw) return;
    const href = raw.trim();
    if (!href) return;
    document.execCommand('createLink', false, href);
    this.syncDescriptionFromEditor(true);
  }

  private focusDescriptionEditor(): void {
    const el = this.descriptionEditorEl();
    if (!el) return;
    el.focus();
  }

  /** After modal opens: normalize markup so plain text and browser `<div>` blobs become real blocks (p, etc.). */
  private bootstrapDescriptionEditor(raw: string): void {
    const el = this.descriptionEditorEl();
    if (!el) return;
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      /* optional */
    }
    const normalized = this.normalizeDescriptionForEditor(raw);
    el.innerHTML = normalized;
    /* Persist normalized + block cleanup into the form without rewriting the DOM again */
    this.syncDescriptionFromEditor(false);
  }

  /**
   * Plain DB text → `<p>` blocks; shallow `<div>` lines (from contenteditable) → `<p>`;
   * keeps lists/headings intact.
   */
  private normalizeDescriptionForEditor(raw: string): string {
    const s = (raw ?? '').trim();
    if (!s) return '<p><br></p>';
    if (!/<[a-z][\s\S]*>/i.test(s)) {
      return this.plainTextToDescriptionHtml(s);
    }
    const container = document.createElement('div');
    container.innerHTML = s;
    this.convertShallowDivsToParagraphs(container);
    return container.innerHTML.trim() || '<p><br></p>';
  }

  private plainTextToDescriptionHtml(text: string): string {
    const parts = text.split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return '<p><br></p>';
    return parts.map((part) => `<p>${escapeHtml(part).replace(/\r?\n/g, '<br>')}</p>`).join('');
  }

  /**
   * Turn contenteditable noise into block markup:
   * - bare text nodes → `<p>`
   * - `<div>` with only phrasing / `<br>` → `<p>`
   * - `<div>` wrapping a single block (e.g. `<p>`, `<ul>`) → unwrap
   * Runs multiple passes so nested `<div><div>a</div></div>` becomes `<p>a</p>`.
   */
  private convertShallowDivsToParagraphs(root: HTMLElement): void {
    for (let i = 0; i < 20; i++) {
      const before = root.innerHTML;
      this.convertShallowDivsToParagraphsOnce(root);
      if (root.innerHTML === before) break;
    }
  }

  private convertShallowDivsToParagraphsOnce(root: HTMLElement): void {
    const blockTagNames = new Set([
      'P',
      'UL',
      'OL',
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'BLOCKQUOTE',
      'PRE',
      'TABLE',
      'SECTION',
      'ARTICLE',
      'HR'
    ]);

    for (const node of [...root.childNodes]) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'DIV') {
        this.convertShallowDivsToParagraphsOnce(node as HTMLElement);
      }
    }

    for (const node of [...root.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE) {
        const rawText = node.textContent ?? '';
        if (!rawText.trim()) {
          node.remove();
          continue;
        }
        const p = document.createElement('p');
        p.textContent = rawText;
        root.replaceChild(p, node);
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as HTMLElement;
      const tag = el.tagName;

      if (tag === 'DIV' && el.childElementCount === 1) {
        const only = el.children[0];
        if (blockTagNames.has(only.tagName)) {
          root.insertBefore(only, el);
          el.remove();
          continue;
        }
      }

      if (tag !== 'DIV') continue;

      let hasBlockOrDivChild = false;
      for (const c of el.children) {
        if (blockTagNames.has(c.tagName) || c.tagName === 'DIV') {
          hasBlockOrDivChild = true;
          break;
        }
      }
      if (hasBlockOrDivChild) continue;

      const p = document.createElement('p');
      p.innerHTML = el.innerHTML;
      root.replaceChild(p, el);
    }
  }

  /** Serialize for API: same block normalization, without touching the live editor (avoids cursor jumps). */
  private serializeDescriptionHtml(raw: string): string {
    const s = (raw ?? '').trim();
    if (!s) return '';
    if (!/<[a-z][\s\S]*>/i.test(s)) {
      const out = this.plainTextToDescriptionHtml(s).trim();
      return this.extractPlainText(out) ? out : '';
    }
    const container = document.createElement('div');
    container.innerHTML = s;
    this.convertShallowDivsToParagraphs(container);
    return container.innerHTML.trim();
  }

  private extractPlainText(html: string): string {
    const d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || '').trim();
  }

  private syncDescriptionFromEditor(liveOnly: boolean): void {
    const el = this.descriptionEditorEl();
    if (!el) return;
    const rawHtml = (el.innerHTML || '').trim();
    const html = liveOnly ? rawHtml : this.serializeDescriptionHtml(rawHtml);
    const text = this.extractPlainText(html);
    this.form.controls.description.setValue(text ? html : '');
  }

  /**
   * Contenteditable sits outside Reactive Forms binding; `#descriptionEditor` syncs here.
   * Falls back to `#open-role-description` when `viewChild` is stale so save is not skipped with an empty `description`.
   */
  private descriptionEditorEl(): HTMLElement | null {
    return this.descriptionEditor()?.nativeElement ?? (typeof document !== 'undefined' ? document.getElementById('open-role-description') : null);
  }

  /** Right before POST: serialize the live editor even if `(input)` did not fire for every keystroke. */
  private flushDescriptionControlFromEditor(): void {
    const el = this.descriptionEditorEl();
    if (!el) return;
    const rawHtml = (el.innerHTML || '').trim();
    const normalized = this.serializeDescriptionHtml(rawHtml);
    const plain = this.extractPlainText(normalized);
    this.form.controls.description.setValue(plain ? normalized : '');
  }
}
