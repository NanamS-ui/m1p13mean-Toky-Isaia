import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShopCategory } from '../../models/shop/shopCategory.model';
@Injectable({
  providedIn: 'root',
})
export class ShopCategoryService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient){}

  getShopCategories(): Observable<ShopCategory[]>{
    return this.http.get<ShopCategory[]>(`${this.apiBaseUrl}/shopCategories`);
  }
}
