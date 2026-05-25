import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { apiUrl } from '@core/api-url';
import { ADMIN_BASE_URL } from '@admin/core/admin-paths';

const TOKEN_KEY = 'zentrox_admin_jwt';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  getToken(): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  setToken(token: string): void {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  logout(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(TOKEN_KEY);
    }
    void this.router.navigateByUrl(ADMIN_BASE_URL);
  }

  login(username: string, password: string): Observable<{ token: string; username: string }> {
    const u = username.trim().toLowerCase();
    return this.http
      .post<{ token: string; username: string }>(apiUrl('/admin/login'), { username: u, password })
      .pipe(tap((r) => this.setToken(r.token)));
  }

  getAccount(): Observable<{ username: string }> {
    return this.http.get<{ username: string }>(apiUrl('/admin/account'));
  }

  updateAccount(body: {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
    confirmPassword?: string;
  }): Observable<{ token: string; username: string }> {
    return this.http.put<{ token: string; username: string }>(apiUrl('/admin/account'), body).pipe(
      tap((r) => {
        if (r.token) this.setToken(r.token);
      })
    );
  }
}
