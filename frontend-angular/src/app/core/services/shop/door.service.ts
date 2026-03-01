import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Door } from '../../models/shop/door.model';
@Injectable({
  providedIn: 'root',
})
export class DoorService{
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient){}

    getDoors():Observable<Door[]>{
        return this.http.get<Door[]>(`${this.apiBaseUrl}/doors`);
    }
    getDoorsByFloor(floorId : string):Observable<Door[]>{
        return this.http.get<Door[]>(`${this.apiBaseUrl}/doors/floor/${floorId}`);
    }
    getAvailableDoorsByFloor(floorId : string):Observable<Door[]>{
        return this.http.get<Door[]>(`${this.apiBaseUrl}/doors/availablefloor/${floorId}`);
    }

}