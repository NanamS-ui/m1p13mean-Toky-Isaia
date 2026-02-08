import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterAcheteurPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  adresse?: string;
}

export interface UserDto {
  _id: string;
  name?: string;
  email?: string;
  phone: string;
  adresse?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  registerAcheteur(payload: RegisterAcheteurPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiBaseUrl}/auth/register-acheteur`, {
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      adresse: payload.adresse ?? '',
      email: payload.email,
      password: payload.password
    });
  }

  verifyEmail(userId: string, code: string): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiBaseUrl}/auth/verify-email`, {
      userId,
      code
    });
  }

  resendVerification(userId: string, email: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiBaseUrl}/auth/resend-verification`, {
      userId,
      email
    });
  }
}
