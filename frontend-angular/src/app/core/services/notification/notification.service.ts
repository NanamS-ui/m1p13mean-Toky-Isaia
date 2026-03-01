import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  target: 'all' | 'acheteurs' | 'boutiques' | 'custom';
  sent_by: { firstName: string; lastName: string };
  is_sent: boolean;
  sent_at: Date;
  created_at: Date;
  read_by?: Array<{ user: string; read_at: Date }>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiBaseUrl = environment.apiBaseUrl;
  private unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {
    this.loadUnreadCount();
  }

  // Créer une notification (admin seulement)
  createNotification(payload: {
    title: string;
    message: string;
    target: 'all' | 'acheteurs' | 'boutiques' | 'custom';
    recipients?: string[];
  }): Observable<Notification> {
    return this.http.post<Notification>(
      `${this.apiBaseUrl}/notifications`,
      payload
    );
  }

  // Récupérer toutes les notifications (admin seulement)
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.apiBaseUrl}/notifications`
    );
  }

  // Récupérer une notification par ID (admin seulement)
  getNotificationById(id: string): Observable<Notification> {
    return this.http.get<Notification>(
      `${this.apiBaseUrl}/notifications/${id}`
    );
  }

  // Récupérer les notifications de l'utilisateur
  getMyNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(
      `${this.apiBaseUrl}/notifications/my`
    );
  }

  // Marquer une notification comme lue
  markAsRead(notificationId: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiBaseUrl}/notifications/${notificationId}/read`,
      {}
    );
  }

  // Marquer toutes les notifications comme lues
  markAllAsRead(): Observable<any> {
    return this.http.post<any>(
      `${this.apiBaseUrl}/notifications/read/all`,
      {}
    );
  }

  // Récupérer le nombre de notifications non lues
  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(
      `${this.apiBaseUrl}/notifications/unread/count`
    );
  }

  // Charger le nombre de notifications non lues
  loadUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (data) => this.unreadCount$.next(data.unreadCount),
      error: () => this.unreadCount$.next(0)
    });
  }

  // Obtenir l'observable du nombre de notifications non lues
  getUnreadCount$(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  // Supprimer une notification (admin seulement)
  deleteNotification(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiBaseUrl}/notifications/${id}`
    );
  }
}
