import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, shareReplay, tap, throwError, timeout } from 'rxjs';
import { CreateEventPayload, EventEntity } from '../../models/events/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private eventsCache$?: Observable<EventEntity[]>;

  constructor(private http: HttpClient) {}

  getEvents(options?: { published?: boolean }, forceRefresh = false): Observable<EventEntity[]> {
    const query = options?.published === undefined ? '' : `?published=${options.published}`;

    // Cache uniquement la liste "par défaut" (sans filtre) pour améliorer le retour lors du changement de section.
    if (!options && !forceRefresh && this.eventsCache$) {
      return this.eventsCache$;
    }

    const request$ = this.http.get<EventEntity[]>(`${this.apiBaseUrl}/events${query}`).pipe(
      timeout(8000),
      catchError((err) => {
        if (!options) this.eventsCache$ = undefined;
        return throwError(() => err);
      }),
      shareReplay(1)
    );

    if (!options) {
      this.eventsCache$ = request$;
    }

    return request$;
  }

  createEvent(payload: CreateEventPayload): Observable<EventEntity> {
    return this.http.post<EventEntity>(`${this.apiBaseUrl}/events`, payload).pipe(
      tap(() => {
        this.eventsCache$ = undefined;
      })
    );
  }

  updateEvent(id: string, payload: Partial<CreateEventPayload> & Record<string, unknown>): Observable<EventEntity> {
    return this.http.put<EventEntity>(`${this.apiBaseUrl}/events/${id}`, payload).pipe(
      tap(() => {
        this.eventsCache$ = undefined;
      })
    );
  }

  deleteEvent(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/events/${id}`).pipe(
      tap(() => {
        this.eventsCache$ = undefined;
      })
    );
  }
}
