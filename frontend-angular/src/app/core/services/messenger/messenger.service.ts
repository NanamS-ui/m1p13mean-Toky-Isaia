import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessengerService{
    private readonly apiBaseUrl = environment.apiBaseUrl;
    
    constructor(private http: HttpClient){}
    getMessagesByUserConnecter(): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/messenger/contacts/last-message`);
    }
    getConversation(recipientId?: string,page?: string, limit ?:string ): Observable<any> {
        let params = new URLSearchParams();
        if (recipientId) {
        params.set('recipientId', recipientId);
        }
        if (page) {
            params.set('page', page);
        }
        if (limit) {
        params.set('limit', limit);
        }
        const queryString = params.toString(); 
        return this.http.get<any>(`${this.apiBaseUrl}/messenger/contacts/conversation${queryString ? '?' + queryString : ''}`);
    }
    createMessage( payload: Partial<any>): Observable<any> {
        return this.http.post<any>(`${this.apiBaseUrl}/messenger`, payload);
    }
}