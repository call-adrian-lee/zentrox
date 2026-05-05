import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from './api-url';
import type { PortfolioPublicItemRow, PortfolioPublicTabRow } from '../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioPublicService {
  private readonly http = inject(HttpClient);

  listPublished(): Observable<{ tabs: PortfolioPublicTabRow[]; items: PortfolioPublicItemRow[] }> {
    return this.http.get<{ tabs: PortfolioPublicTabRow[]; items: PortfolioPublicItemRow[] }>(apiUrl('/portfolio'));
  }
}
