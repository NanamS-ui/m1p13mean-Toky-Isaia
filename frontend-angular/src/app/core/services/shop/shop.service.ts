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
}
