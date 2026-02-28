import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shop } from '../../models/shop/shop.model';

export interface ShopCategory {
  _id: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  
  constructor(private http : HttpClient){}

  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.apiBaseUrl}/shops`);
  }

  getActiveShops(floor?: string | number, category?: string): Observable<Shop[]> {
    let url = `${this.apiBaseUrl}/shops/active`;
    const params: string[] = [];
    
    if (floor && floor !== 'ALL') {
      params.push(`floor=${floor}`);
    }
    
    if (category && category !== 'ALL') {
      params.push(`category=${category}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<Shop[]>(url);
  }

  getTopShops(limit = 10): Observable<Array<Shop & { avgRating: number; ratingCount: number }>> {
    return this.http.get<Array<Shop & { avgRating: number; ratingCount: number }>>(
      `${this.apiBaseUrl}/shops/top?limit=${limit}`
    );
  }

  getMyFavoriteShopIds(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiBaseUrl}/shops/favorites/ids/my`);
  }

  isFavoriteShop(shopId: string): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.apiBaseUrl}/shops/${shopId}/favorite`);
  }

  addFavoriteShop(shopId: string): Observable<{ message: string; favoriteShops: string[] }> {
    return this.http.post<{ message: string; favoriteShops: string[] }>(`${this.apiBaseUrl}/shops/${shopId}/favorite`, {});
  }

  removeFavoriteShop(shopId: string): Observable<{ message: string; favoriteShops: string[] }> {
    return this.http.delete<{ message: string; favoriteShops: string[] }>(`${this.apiBaseUrl}/shops/${shopId}/favorite`);
  }

  getShopsByOwner():Observable<Shop[]>{
    return this.http.get<Shop[]>(`${this.apiBaseUrl}/shops/shop/owner`);
  }
  getOwner():Observable<any>{
    return this.http.get<any>(`${this.apiBaseUrl}/users/user/proprietaire`);
  }
  getShopById2(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/shops/${id}`);
  }
  getShopById(id: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiBaseUrl}/shops/${id}`);
  }

  getShopCategories(): Observable<ShopCategory[]> {
    return this.http.get<ShopCategory[]>(`${this.apiBaseUrl}/shopCategories`);
  }

  createShop(payload: Partial<Shop>): Observable<Shop> {
    return this.http.post<Shop>(`${this.apiBaseUrl}/shops`, payload);
  }
  createShopWithOwner(payload: Partial<Shop>): Observable<Shop> {
    return this.http.post<Shop>(`${this.apiBaseUrl}/shops/boutique/owner`, payload);
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
