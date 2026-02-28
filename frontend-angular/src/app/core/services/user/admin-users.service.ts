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

export type AdminUserSearchItem = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: AdminUserRoleValue;
};

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly apiBaseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getUsersForGestionAdmin(): Observable<AdminUserForGestionAdmin[]> {
    return this.http.get<AdminUserForGestionAdmin[]>(`${this.apiBaseUrl}/users/gestion/admin`);
  }

  searchUsers(q: string, role: 'acheteurs' | 'boutiques', limit = 20): Observable<AdminUserSearchItem[]> {
    return this.http.get<AdminUserSearchItem[]>(`${this.apiBaseUrl}/users/search`, {
      params: {
        q,
        role,
        limit: String(limit)
      }
    });
  }

  exportUsersExcel(): Observable<Blob> {
    return this.http.get(`${this.apiBaseUrl}/users/export/excel`, {
      responseType: 'blob',
    });
  }
  updateUsers(id: string, payload: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.apiBaseUrl}/users/${id}`, payload);
  }
  addSuspension(id: string, payload: Partial<any>): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/users/${id}/suspensions`, payload);
  }
  reactiverUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiBaseUrl}/users/user/reactive`, null, {
      params: { userId },
    });
  }
  getUsersRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/roles`);
  }
  getUsersStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/user_status`);
  }
}
