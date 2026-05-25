import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '@core/api-url';
import type { OpenRoleApplicationRow } from '@shared/models/open-roles.models';

@Injectable({ providedIn: 'root' })
export class AdminApplicationsApiService {
  private readonly http = inject(HttpClient);

  listApplications(roleId?: number): Observable<{ applications: OpenRoleApplicationRow[] }> {
    const q = roleId != null && roleId > 0 ? `?roleId=${roleId}` : '';
    return this.http.get<{ applications: OpenRoleApplicationRow[] }>(
      apiUrl(`/admin/open-role-applications${q}`)
    );
  }

  deleteApplication(id: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(apiUrl(`/admin/open-role-applications/${id}`));
  }
}
