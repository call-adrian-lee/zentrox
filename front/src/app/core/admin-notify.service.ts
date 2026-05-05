import { Injectable, signal } from '@angular/core';

export interface AdminNotice {
  id: number;
  messageKey: string;
  kind: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class AdminNotifyService {
  readonly notices = signal<AdminNotice[]>([]);
  private nextId = 1;

  success(messageKey: string): void {
    this.push('success', messageKey);
  }

  error(messageKey: string): void {
    this.push('error', messageKey);
  }

  private push(kind: 'success' | 'error', messageKey: string): void {
    const id = this.nextId++;
    this.notices.update((items) => [...items, { id, messageKey, kind }]);
    setTimeout(() => this.dismiss(id), kind === 'error' ? 4200 : 2800);
  }

  dismiss(id: number): void {
    this.notices.update((items) => items.filter((n) => n.id !== id));
  }
}
