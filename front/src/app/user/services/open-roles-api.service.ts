import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@core/api-url';
import type { OpenRole, OpenRoleApplyPayload } from '@shared/models/open-roles.models';

@Injectable({ providedIn: 'root' })
export class OpenRolesApiService {
  private readonly http = inject(HttpClient);

  listPublished(): Observable<{ roles: OpenRole[] }> {
    return this.http.get<{ roles: OpenRole[] }>(apiUrl('/open-roles'));
  }

  getPublished(id: number): Observable<{ role: OpenRole }> {
    return this.http.get<{ role: OpenRole }>(apiUrl(`/open-roles/${id}`));
  }

  apply(roleId: number, body: OpenRoleApplyPayload): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(apiUrl(`/open-roles/${roleId}/applications`), body);
  }
}
