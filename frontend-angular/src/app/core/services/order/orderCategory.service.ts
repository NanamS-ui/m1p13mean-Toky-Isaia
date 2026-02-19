import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderCategory } from '../../models/order/order-category.model';
@Injectable({
  providedIn: 'root',
})
export class OrderCategoryService{
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient){}
    
    getOrderCategorys(): Observable<OrderCategory[]> {
    return this.http.get<OrderCategory[]>(`${this.apiBaseUrl}/orderCategories`);
    }
}