import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ShopReviewService{
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient){}

    getShopReviewByOwner():Observable<any>{
        return this.http.get<any>(`${this.apiBaseUrl}/shopReviews/boutique/by-owner`);
    }
    getShopReviewByShop(shopId : string):Observable<any>{
        return this.http.get<any>(`${this.apiBaseUrl}/shopReviews/boutique/by-shop?shopId=${shopId}`);
    }
    updateShopReview(idSHopReview : string, payload : Partial<any>):Observable<any>{
        return this.http.put<any>(`${this.apiBaseUrl}/shopReviews/${idSHopReview}`,payload);
    }

}