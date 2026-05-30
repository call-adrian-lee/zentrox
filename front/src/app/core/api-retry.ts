import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry } from 'rxjs/operators';

/** HTTP statuses worth retrying (API boot, proxy blips, network loss). */
export function isTransientApiError(err: unknown): boolean {
  if (!(err instanceof HttpErrorResponse)) return false;
  return err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504;
}

/** Retry only transient API failures; fail fast on 4xx/5xx that will not recover. */
export function retryTransientApi<T>(maxAttempts = 6) {
  return retry<T>({
    count: maxAttempts,
    delay: (err, attempt) => {
      if (!isTransientApiError(err)) return throwError(() => err);
      return timer(Math.min(1500 * attempt, 8000));
    }
  });
}
