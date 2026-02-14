import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../../models/product/stock.model';

@Injectable({
  providedIn: 'root',
})
export class StockService {

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiBaseUrl}/stocks`);
  }

  getStockById(id: string): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiBaseUrl}/stocks/${id}`);
  }

  createStock(payload: Partial<Stock>): Observable<Stock> {
    return this.http.post<Stock>(`${this.apiBaseUrl}/stocks`, payload);
  }

  updateStock(id: string, payload: Partial<Stock>): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiBaseUrl}/stocks/${id}`, payload);
  }

  deleteStock(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/stocks/${id}`);
  }
}
