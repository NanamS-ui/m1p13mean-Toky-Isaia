import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductCategory } from '../../models/product/product-category.model';

@Injectable({
  providedIn: 'root',
})
export class ProductCategoryService {

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getProductCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.apiBaseUrl}/productCategories`);
  }

  getProductCategoryById(id: string): Observable<ProductCategory> {
    return this.http.get<ProductCategory>(`${this.apiBaseUrl}/productCategories/${id}`);
  }

  createProductCategory(payload: Partial<ProductCategory>): Observable<ProductCategory> {
    return this.http.post<ProductCategory>(`${this.apiBaseUrl}/productCategories`, payload);
  }

  updateProductCategory(id: string, payload: Partial<ProductCategory>): Observable<ProductCategory> {
    return this.http.put<ProductCategory>(`${this.apiBaseUrl}/productCategories/${id}`, payload);
  }

  deleteProductCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiBaseUrl}/productCategories/${id}`);
  }
}
