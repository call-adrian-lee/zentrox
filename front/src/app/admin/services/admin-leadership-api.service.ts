import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@core/api-url';
import type { LeadershipMember, PublishStatus } from '@shared/models/leadership.models';

@Injectable({ providedIn: 'root' })
export class AdminLeadershipApiService {
  private readonly http = inject(HttpClient);

  listLeadership(): Observable<{ members: LeadershipMember[] }> {
    return this.http.get<{ members: LeadershipMember[] }>(apiUrl('/admin/leadership'));
  }

  createLeadership(body: {
    name: string;
    roleTitle: string;
    blurb: string;
    badgeLabel?: string | null;
    cardAria?: string | null;
    ctaLabel?: string | null;
    ctaAria?: string | null;
    ctaPath?: string | null;
    openSeat?: boolean;
    status: PublishStatus;
  }): Observable<{ id: number; photoPath?: string }> {
    return this.http.post<{ id: number; photoPath?: string }>(apiUrl('/admin/leadership'), body);
  }

  updateLeadership(
    id: number,
    body: Partial<{
      name: string;
      roleTitle: string;
      blurb: string;
      badgeLabel: string | null;
      cardAria: string | null;
      ctaLabel: string | null;
      ctaAria: string | null;
      ctaPath: string | null;
      openSeat: boolean;
      status: PublishStatus;
    }>
  ): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(apiUrl(`/admin/leadership/${id}`), body);
  }

  reorderLeadershipIds(ids: number[]): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(apiUrl('/admin/leadership/reorder'), { ids });
  }

  deleteLeadership(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(apiUrl(`/admin/leadership/${id}`));
  }
}
