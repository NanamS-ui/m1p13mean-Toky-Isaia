import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Upload une image vers Cloudinary via le backend
   * @param base64Data Données de l'image en base64
   * @param folderName Dossier de destination dans Cloudinary (défaut: 'products')
   * @returns Observable avec les données de l'image uploadée
   */
  uploadImage(base64Data: string, folderName: string = 'products'): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/products/upload-image`, {
      image: base64Data
    });
  }
}
