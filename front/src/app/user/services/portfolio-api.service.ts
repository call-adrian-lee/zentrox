import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@core/api-url';
import type { PortfolioPublicItemRow, PortfolioPublicTabRow } from '@shared/models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private readonly http = inject(HttpClient);

  listPublished(): Observable<{ tabs: PortfolioPublicTabRow[]; items: PortfolioPublicItemRow[] }> {
    return this.http.get<{ tabs: PortfolioPublicTabRow[]; items: PortfolioPublicItemRow[] }>(apiUrl('/portfolio'));
  }
}
