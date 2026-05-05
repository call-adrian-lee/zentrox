import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from './api-url';
import type { Job, JobApplyPayload } from './job.models';

@Injectable({ providedIn: 'root' })
export class JobsPublicService {
  private readonly http = inject(HttpClient);

  listPublished(): Observable<{ jobs: Job[] }> {
    return this.http.get<{ jobs: Job[] }>(apiUrl('/jobs'));
  }

  getPublished(id: number): Observable<{ job: Job }> {
    return this.http.get<{ job: Job }>(apiUrl(`/jobs/${id}`));
  }

  apply(jobId: number, body: JobApplyPayload): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(apiUrl(`/jobs/${jobId}/apply`), body);
  }
}
