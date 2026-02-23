import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type AdminUserStatusValue = {
  _id?: string;
  value?: string;
};

export type AdminUserRoleValue = {
  _id?: string;
  val?: string;
};

export type AdminUserForGestionAdmin = {
  _id: string;
  name?: string;
  email?: string;
  role?: AdminUserRoleValue;
  status?: AdminUserStatusValue;
  created_at?: string;
  isSuspended?: boolean;
  suspensionEndDate?: string | null;
};

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getUsersForGestionAdmin(): Observable<AdminUserForGestionAdmin[]> {
    return this.http.get<AdminUserForGestionAdmin[]>(`${this.apiBaseUrl}/users/gestion/admin`);
  }

  exportUsersExcel(): Observable<Blob> {
    return this.http.get(`${this.apiBaseUrl}/users/export/excel`, {
      responseType: 'blob'
    });
  }
}
