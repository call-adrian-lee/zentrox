import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from './api-url';
import type { Job, JobApplicationRow, JobStatus } from './job.models';
import type { MvpItem, MvpStatus } from './mvp.models';
import type { LeadershipMember, PublishStatus } from './leadership.models';
import type { PortfolioItemAdmin, PortfolioPublishStatus, PortfolioTabAdmin } from '../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);

  listJobs(): Observable<{ jobs: Job[] }> {
    return this.http.get<{ jobs: Job[] }>(apiUrl('/admin/jobs'));
  }

  createJob(body: {
    title: string;
    description: string;
    location?: string;
    employmentType?: string;
    status: JobStatus;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(apiUrl('/admin/jobs'), body);
  }

  updateJob(
    id: number,
    body: Partial<{
      title: string;
      description: string;
      location: string;
      employmentType: string;
      status: JobStatus;
    }>
  ): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(apiUrl(`/admin/jobs/${id}`), body);
  }

  deleteJob(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(apiUrl(`/admin/jobs/${id}`));
  }

  listApplications(jobId?: number): Observable<{ applications: JobApplicationRow[] }> {
    const q = jobId != null && jobId > 0 ? `?jobId=${jobId}` : '';
    return this.http.get<{ applications: JobApplicationRow[] }>(apiUrl(`/admin/applications${q}`));
  }

  deleteApplication(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(apiUrl(`/admin/applications/${id}`));
  }

  listMvp(): Observable<{ items: MvpItem[] }> {
    return this.http.get<{ items: MvpItem[] }>(apiUrl('/admin/mvp'));
  }

  createMvp(body: {
    name: string;
    focus: string;
    stage: string;
    status: MvpStatus;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(apiUrl('/admin/mvp'), body);
  }

  updateMvp(
    id: number,
    body: Partial<{
      name: string;
      focus: string;
      stage: string;
      status: MvpStatus;
    }>
  ): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(apiUrl(`/admin/mvp/${id}`), body);
  }

  deleteMvp(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(apiUrl(`/admin/mvp/${id}`));
  }

  /** Sets `sort_order` from array index (full list from admin UI). */
  reorderMvpIds(ids: number[]): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(apiUrl('/admin/mvp/reorder'), { ids });
  }

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

  listPortfolioTabs(): Observable<{ tabs: PortfolioTabAdmin[] }> {
    return this.http.get<{ tabs: PortfolioTabAdmin[] }>(apiUrl('/admin/portfolio/tabs'));
  }

  createPortfolioTab(body: {
    title: string;
    status: PortfolioPublishStatus;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(apiUrl('/admin/portfolio/tabs'), body);
  }

  updatePortfolioTab(
    id: number,
    body: Partial<{ title: string; status: PortfolioPublishStatus }>
  ): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(apiUrl(`/admin/portfolio/tabs/${id}`), body);
  }

  reorderPortfolioTabIds(ids: number[]): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(apiUrl('/admin/portfolio/tabs/reorder'), { ids });
  }

  deletePortfolioTab(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(apiUrl(`/admin/portfolio/tabs/${id}`));
  }

  listPortfolioItems(): Observable<{ items: PortfolioItemAdmin[] }> {
    return this.http.get<{ items: PortfolioItemAdmin[] }>(apiUrl('/admin/portfolio/items'));
  }

  createPortfolioItem(body: {
    tabId: number;
    title: string;
    subtitle?: string | null;
    description: string;
    linkUrl: string;
    status: PortfolioPublishStatus;
  }): Observable<{ id: number; imagePath?: string }> {
    return this.http.post<{ id: number; imagePath?: string }>(apiUrl('/admin/portfolio/items'), body);
  }

  updatePortfolioItem(
    id: number,
    body: Partial<{
      tabId: number;
      title: string;
      subtitle: string | null;
      description: string;
      linkUrl: string;
      status: PortfolioPublishStatus;
    }>
  ): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(apiUrl(`/admin/portfolio/items/${id}`), body);
  }

  reorderPortfolioItemIds(tabId: number, ids: number[]): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(apiUrl('/admin/portfolio/items/reorder'), { tabId, ids });
  }

  deletePortfolioItem(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(apiUrl(`/admin/portfolio/items/${id}`));
  }

  /** Multipart upload: writes `front/img/portfolio/portfolio-{itemId}.png` on the server. */
  uploadPortfolioItemImage(itemId: number, file: File): Observable<{ imagePath: string }> {
    const body = new FormData();
    body.append('photo', file);
    body.append('itemId', String(itemId));
    return this.http.post<{ imagePath: string }>(apiUrl('/admin/portfolio/image'), body);
  }
}
