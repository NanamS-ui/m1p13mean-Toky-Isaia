import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CreatePaymentIntentPayload {
  orderId: string;
  currency?: string;
}

export interface CreatePaymentIntentResponse {
  payment: any;
  clientSecret: string;
}

export interface CreateBankPaymentPayload {
  orderId: string;
  bankDetails: {
    bank_name: string;
    account_holder: string;
    account_number?: string;
    note?: string;
  };
}

export interface CreateBankPaymentResponse {
  payment: any;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  createBankPayment(payload: CreateBankPaymentPayload): Observable<CreateBankPaymentResponse> {
    return this.http.post<CreateBankPaymentResponse>(`${this.apiBaseUrl}/payments/bank`, payload);
  }

  getLatestPaymentForOrder(orderId: string): Observable<any | null> {
    return this.http.get<any | null>(`${this.apiBaseUrl}/payments/order/${orderId}`);
  }
}
