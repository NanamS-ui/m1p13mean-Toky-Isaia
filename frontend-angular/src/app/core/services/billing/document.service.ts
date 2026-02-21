import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  downloadInvoice(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiBaseUrl}/documents/order/${orderId}/invoice`, {
      responseType: 'blob'
    });
  }

  downloadReceipt(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiBaseUrl}/documents/order/${orderId}/receipt`, {
      responseType: 'blob'
    });
  }
}
