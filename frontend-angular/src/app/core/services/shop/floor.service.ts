import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Floor } from '../../models/shop/floor.model';
@Injectable({
  providedIn: 'root',
})
export class FloorService{
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient){}

    getFloors():Observable<Floor[]>{
        return this.http.get<Floor[]>(`${this.apiBaseUrl}/floors`);
    }
}