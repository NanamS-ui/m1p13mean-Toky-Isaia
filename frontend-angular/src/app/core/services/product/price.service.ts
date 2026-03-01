import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Price } from '../../models/product/price.model';

@Injectable({
  providedIn: 'root',
})
export class PriceService {

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getPrices(): Observable<Price[]> {
    return this.http.get<Price[]>(`${this.apiBaseUrl}/prices`);
  }

  getPriceById(id: string): Observable<Price> {
    return this.http.get<Price>(`${this.apiBaseUrl}/prices/${id}`);
  }

  createPrice(payload: Partial<Price>): Observable<Price> {
    return this.http.post<Price>(`${this.apiBaseUrl}/prices`, payload);
  }

  updatePrice(id: string, payload: Partial<Price>): Observable<Price> {
    return this.http.put<Price>(`${this.apiBaseUrl}/prices/${id}`, payload);
  }

  deletePrice(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/prices/${id}`);
  }
}
