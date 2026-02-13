import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UploadResponse {
  url: string;
  publicId: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  uploadShopLogo(base64Image: string): Observable<UploadResponse> {
    return this.http.post<UploadResponse>(`${this.apiBaseUrl}/shops/upload/logo`, {
      image: base64Image
    });
  }
}
