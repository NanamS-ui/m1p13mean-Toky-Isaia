import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ServiceCenterConfig } from '../../models/config/service-center.model';

@Injectable({ providedIn: 'root' })
export class ServiceCenterService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ServiceCenterConfig[]> {
    return this.http.get<ServiceCenterConfig[]>(`${this.apiBaseUrl}/serviceCenters`);
  }

  getById(id: string): Observable<ServiceCenterConfig> {
    return this.http.get<ServiceCenterConfig>(`${this.apiBaseUrl}/serviceCenters/${id}`);
  }

  create(payload: Pick<ServiceCenterConfig, 'value' | 'description'>): Observable<ServiceCenterConfig> {
    return this.http.post<ServiceCenterConfig>(`${this.apiBaseUrl}/serviceCenters`, payload);
  }

  update(id: string, payload: Partial<Pick<ServiceCenterConfig, 'value' | 'description'>>): Observable<ServiceCenterConfig> {
    return this.http.put<ServiceCenterConfig>(`${this.apiBaseUrl}/serviceCenters/${id}`, payload);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/serviceCenters/${id}`);
  }
}
