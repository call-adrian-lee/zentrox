import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@core/api-url';
import type { QuoteRow, QuoteStatus } from '@shared/models/quote.models';

@Injectable({ providedIn: 'root' })
export class AdminQuotesApiService {
  private readonly http = inject(HttpClient);

  listQuotes(): Observable<{ quotes: QuoteRow[] }> {
    return this.http.get<{ quotes: QuoteRow[] }>(apiUrl('/admin/quotes'));
  }

  updateQuote(
    id: number,
    body: Partial<{ status: QuoteStatus; adminNotes: string | null }>
  ): Observable<{ ok: boolean }> {
    return this.http.patch<{ ok: boolean }>(apiUrl(`/admin/quotes/${id}`), body);
  }

  deleteQuote(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(apiUrl(`/admin/quotes/${id}`));
  }
}
