import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupportClientService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getMySupportClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/support_clients/user`);
  }

  getTypeSupportClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/type_support_clients`);
  }

  createSupportClientByUser(payload: { type_support_client: string; sujet: string }): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/support_clients/user`, payload);
  }
}
