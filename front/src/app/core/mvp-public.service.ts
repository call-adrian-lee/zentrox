import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from './api-url';
import type { MvpItem } from './mvp.models';

@Injectable({ providedIn: 'root' })
export class MvpPublicService {
  private readonly http = inject(HttpClient);

  listPublished(): Observable<{ items: MvpItem[] }> {
    return this.http.get<{ items: MvpItem[] }>(apiUrl('/mvp'));
  }
}
