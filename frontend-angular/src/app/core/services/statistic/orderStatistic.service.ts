import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderStatisticService{
    private readonly apiBaseUrl = environment.apiBaseUrl;
  
  constructor(private http : HttpClient){}
  getBoutiqueDashboard() : Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/stats/orders/boutique/dashboard`);
  }
  getBoutiqueStatistique(startDate?: string, endDate?: string): Observable<any> {
    let params = new URLSearchParams();

    if (startDate) {
      params.set('startDate', startDate);
    }
    if (endDate) {
      params.set('endDate', endDate);
    }

    const queryString = params.toString(); 
    const url = `${this.apiBaseUrl}/stats/orders/boutique${queryString ? '?' + queryString : ''}`;

    return this.http.get<any>(url);
  }

}