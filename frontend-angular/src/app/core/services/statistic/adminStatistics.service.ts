import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminStatisticsService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getAdminDashboard(startDate?: string, endDate?: string): Observable<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<any>(`${this.apiBaseUrl}/adminStats/dashboard`, { params });
  }

  getAdminStatistics(startDate?: string, endDate?: string): Observable<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get<any>(`${this.apiBaseUrl}/adminStats/statistics`, { params });
  }

  exportAdminStatisticsExcel(startDate?: string, endDate?: string): Observable<Blob> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.http.get(`${this.apiBaseUrl}/adminStats/export/excel`, {
      params,
      responseType: 'blob'
    });
  }
}
