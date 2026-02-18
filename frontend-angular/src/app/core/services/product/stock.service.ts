import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock, StockView } from '../../models/product/stock.model';
import { CatalogFilterCriteria, CatalogProduct } from '../../models/product/catalog-product.model';

@Injectable({
  providedIn: 'root',
})
export class StockService {

  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  
  getStockPricePromotion():Observable<Stock[]>{
    return this.http.get<Stock[]>(`${this.apiBaseUrl}/stocks/stock/owner`)
  }

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiBaseUrl}/stocks`);
  }

  getCatalog(criteria: CatalogFilterCriteria): Observable<CatalogProduct[]> {
    let params = new HttpParams();
    if (criteria.searchQuery) params = params.set('searchQuery', criteria.searchQuery);
    if (criteria.selectedCategory) params = params.set('selectedCategory', criteria.selectedCategory);
    if (criteria.minPrice !== null && criteria.minPrice !== undefined) {
      params = params.set('minPrice', String(criteria.minPrice));
    }
    if (criteria.maxPrice !== null && criteria.maxPrice !== undefined) {
      params = params.set('maxPrice', String(criteria.maxPrice));
    }
    if (criteria.inStockOnly) params = params.set('inStockOnly', 'true');
    if (criteria.onPromoOnly) params = params.set('onPromoOnly', 'true');
    if (criteria.sortBy) params = params.set('sortBy', criteria.sortBy);

    return this.http.get<CatalogProduct[]>(`${this.apiBaseUrl}/stocks/catalog`, { params });
  }

  getCatalogForShop(shopId: string): Observable<CatalogProduct[]> {
    const params = new HttpParams().set('shopId', shopId);
    return this.http.get<CatalogProduct[]>(`${this.apiBaseUrl}/stocks/catalog`, { params });
  }

  getCatalogByProduct(productId: string): Observable<CatalogProduct[]> {
    const params = new HttpParams().set('productId', productId);
    return this.http.get<CatalogProduct[]>(`${this.apiBaseUrl}/stocks/catalog`, { params });
  }

  getStockById(id: string): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiBaseUrl}/stocks/${id}`);
  }

  getStockViewById(id: string): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiBaseUrl}/stocks/stock/view/${id}`);
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
