import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminSupportService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}
    getSupportClientsByDate(startDate?: string, endDate?: string): Observable<any> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        return this.http.get<any>(`${this.apiBaseUrl}/support_clients/filter/date`, { params });
    }
    getStatusSupportClients():Observable<any>{
        return this.http.get<any>(`${this.apiBaseUrl}/status_support_clients`);
    }
    getTypeSupportClients():Observable<any>{
        return this.http.get<any>(`${this.apiBaseUrl}/type_support_clients`);
    }
    updateSupport(id: string, payload: Partial<any>): Observable<any> {
        return this.http.put<any>(`${this.apiBaseUrl}/support_clients/${id}`, payload);
    }

}