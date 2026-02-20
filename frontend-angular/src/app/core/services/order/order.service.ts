import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../../models/order/order.model';

export interface CreateOrderItemPayload {
    stock: string;
    unit_price: number;
    promotion_percentage: number;
    quantity: number;
}

export interface CreateOrderWithItemsPayload {
    total: number;
    orderItems: CreateOrderItemPayload[];
}
@Injectable({
  providedIn: 'root',
})
export class OrdersService{
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient){}
    getBoutiqueStatistique(shopOwnerId?: string): Observable<Order[]> {
        let params = new URLSearchParams();

        if (shopOwnerId) {
        params.set('shopOwnerId', shopOwnerId);
        }
        const queryString = params.toString(); 
        const url = `${this.apiBaseUrl}/orders/owner/shop${queryString ? '?' + queryString : ''}`;
        return this.http.get<Order[]>(url);
    }
    getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiBaseUrl}/orders/${id}`);
    }
    getOrderByIdAny(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/orders/${id}`);
    }

    getMyOrders(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBaseUrl}/orders/buyer`);
    }
    updateOrder(id: string, payload: Partial<any>): Observable<any> {
        return this.http.put<any>(`${this.apiBaseUrl}/orders/${id}`, payload);
    }

        createOrderWithItems(payload: CreateOrderWithItemsPayload): Observable<Order> {
            return this.http.post<Order>(`${this.apiBaseUrl}/orders/items`, payload);
        }
}