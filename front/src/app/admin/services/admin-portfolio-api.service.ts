import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@core/api-url';
import type {
  PortfolioItemAdmin,
  PortfolioPublishStatus,
  PortfolioTabAdmin
} from '@shared/models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class AdminPortfolioApiService {
  private readonly http = inject(HttpClient);

  listPortfolioTabs(): Observable<{ tabs: PortfolioTabAdmin[] }> {
    return this.http.get<{ tabs: PortfolioTabAdmin[] }>(apiUrl('/admin/portfolio/tabs'));
  }

  createPortfolioTab(body: { title: string; status: PortfolioPublishStatus }): Observable<{ id: number }> {
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

  uploadPortfolioItemImage(itemId: number, file: File): Observable<{ imagePath: string }> {
    const body = new FormData();
    body.append('photo', file);
    body.append('itemId', String(itemId));
    return this.http.post<{ imagePath: string }>(apiUrl('/admin/portfolio/image'), body);
  }
}
