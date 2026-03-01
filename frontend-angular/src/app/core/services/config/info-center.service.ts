import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { InfoCenter } from '../../models/config/info-center.model';

@Injectable({ providedIn: 'root' })
export class InfoCenterService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InfoCenter[]> {
    return this.http.get<InfoCenter[]>(`${this.apiBaseUrl}/infoCenter`);
  }

  getById(id: string): Observable<InfoCenter> {
    return this.http.get<InfoCenter>(`${this.apiBaseUrl}/infoCenter/${id}`);
  }

  create(payload: Partial<InfoCenter>): Observable<InfoCenter> {
    return this.http.post<InfoCenter>(`${this.apiBaseUrl}/infoCenter`, payload);
  }

  update(id: string, payload: Partial<InfoCenter>): Observable<InfoCenter> {
    return this.http.put<InfoCenter>(`${this.apiBaseUrl}/infoCenter/${id}`, payload);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/infoCenter/${id}`);
  }
}
