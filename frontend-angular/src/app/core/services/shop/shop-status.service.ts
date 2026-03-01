import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShopStatus } from '../../models/shop/shopStatus.model';

@Injectable({
  providedIn: 'root',
})
export class ShopStatusService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http : HttpClient){}
  
  getShopStatus():Observable<ShopStatus[]>{
    return this.http.get<ShopStatus[]>(`${this.apiBaseUrl}/shopStatus`);
  }
}
