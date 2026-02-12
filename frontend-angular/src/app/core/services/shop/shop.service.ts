import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shop } from '../../models/shop/shop.model';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  
  constructor(private http : HttpClient){}

  getShops():Observable<Shop[]>{
    return this.http.get<Shop[]>(`${this.apiBaseUrl}/shops`);
  }
  getShopById(id: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiBaseUrl}/shops/${id}`);
  }

  createShop(payload: Partial<Shop>): Observable<Shop> {
    return this.http.post<Shop>(`${this.apiBaseUrl}/shops`, payload);
  }

  updateShop(id: string, payload: Partial<Shop>): Observable<Shop> {
    return this.http.put<Shop>(`${this.apiBaseUrl}/shops/${id}`, payload);
  }
  deleteShop(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/shops/${id}`);
  }
  updateShopStatus(status_value: string, id_shop: string): Observable<Shop> {
    return this.http.put<Shop>(`${this.apiBaseUrl}/shops/shop/status`, {
      status_value,
      id_shop
    });
  }

}
