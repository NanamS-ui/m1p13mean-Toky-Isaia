import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderItem } from '../../models/order/order-item.model';
@Injectable({
  providedIn: 'root',
})
export class OrdersService{
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient){}
    
    getOrderItems(): Observable<OrderItem> {
    return this.http.get<OrderItem>(`${this.apiBaseUrl}/orderItems`);
    }
}