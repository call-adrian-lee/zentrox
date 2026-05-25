import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@core/api-url';
import type { QuoteSubmitPayload } from '@shared/models/quote.models';

@Injectable({ providedIn: 'root' })
export class QuoteApiService {
  private readonly http = inject(HttpClient);

  submitQuote(body: QuoteSubmitPayload): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(apiUrl('/quotes'), body);
  }
}
