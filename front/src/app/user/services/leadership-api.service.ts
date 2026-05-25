import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@core/api-url';
import type { LeadershipMemberPublic } from '@shared/models/leadership.models';

@Injectable({ providedIn: 'root' })
export class LeadershipApiService {
  private readonly http = inject(HttpClient);

  listPublished(): Observable<{ members: LeadershipMemberPublic[] }> {
    return this.http.get<{ members: LeadershipMemberPublic[] }>(apiUrl('/leadership'));
  }
}
