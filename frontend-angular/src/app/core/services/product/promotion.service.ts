import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promotion } from '../../models/product/promotion.model';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiBaseUrl}/promotions`);
  }

  getPromotionById(id: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiBaseUrl}/promotions/${id}`);
  }

  createPromotion(payload: Partial<Promotion>): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.apiBaseUrl}/promotions`, payload);
  }

  updatePromotion(id: string, payload: Partial<Promotion>): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiBaseUrl}/promotions/${id}`, payload);
  }

  deletePromotion(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/promotions/${id}`);
  }
}
