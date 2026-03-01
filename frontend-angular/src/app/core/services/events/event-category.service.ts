import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventCategory } from '../../models/events/event-category.model';

@Injectable({
  providedIn: 'root',
})
export class EventCategoryService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getEventCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(`${this.apiBaseUrl}/eventCategories`);
  }
}
