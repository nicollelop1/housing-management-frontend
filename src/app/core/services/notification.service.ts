import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private readonly BASE = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.BASE);
  }

  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.BASE}/unread`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.BASE}/unread/count`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.BASE}/${id}/read`, {});
  }
}