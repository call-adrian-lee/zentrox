import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@core/api-url';
import type { OpenRole, OpenRoleStatus } from '@shared/models/open-roles.models';

@Injectable({ providedIn: 'root' })
export class AdminOpenRolesApiService {
  private readonly http = inject(HttpClient);

  listOpenRoles(): Observable<{ roles: OpenRole[] }> {
    return this.http.get<{ roles: OpenRole[] }>(apiUrl('/admin/open-roles'));
  }

  createOpenRole(body: {
    title: string;
    description: string;
    location?: string;
    employmentType?: string;
    status: OpenRoleStatus;
  }): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(apiUrl('/admin/open-roles'), body);
  }

  updateOpenRole(
    id: number,
    body: Partial<{
      title: string;
      description: string;
      location: string;
      employmentType: string;
      status: OpenRoleStatus;
    }>
  ): Observable<{ ok: boolean }> {
    return this.http.put<{ ok: boolean }>(apiUrl(`/admin/open-roles/${id}`), body);
  }

  deleteOpenRole(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(apiUrl(`/admin/open-roles/${id}`));
  }
}
