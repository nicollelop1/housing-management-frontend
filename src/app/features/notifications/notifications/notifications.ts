import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit, OnDestroy {

  notifications: Notification[] = []; 
  loading = true;
  private pendingUpdates = new Set<string>();

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { 
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.pendingUpdates.clear();
  }

  loadNotifications(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.notificationService.getAll().subscribe({
      next: (data) => {
        this.notifications = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar notificaciones:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openNotification(notification: Notification): void {
    if (notification.read) {
      this.handleNavigation(notification);
      return;
    }

    if (this.pendingUpdates.has(notification.id)) return;

    this.pendingUpdates.add(notification.id);
    
    notification.read = true;
    this.cdr.detectChanges();

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        console.log('Backend actualizó con éxito:', notification.id);
        this.pendingUpdates.delete(notification.id);
        this.handleNavigation(notification);
      },
      error: (err) => {
        console.error('El backend falló al marcar como leída:', err);
        notification.read = false;
        this.pendingUpdates.delete(notification.id);
        this.cdr.detectChanges();
      }
    });
  }

  private handleNavigation(notification: Notification): void {
    if (notification.contractId) {
      this.router.navigate(['/contracts', notification.contractId]);
      return;
    }

    if (notification.type === 'RENTAL_REQUEST') {
      this.router.navigate(['/rental-requests/owner']);
      return;
    }
    
    if (notification.type === 'PAYMENT') {
      this.router.navigate(['/contracts']);
      return;
    }
    
    if (notification.type === 'SYSTEM') {
      this.router.navigate(['/home']);
      return;
    }
  }

  markAllAsRead(): void {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) return;
    
    unreadNotifications.forEach(notif => {
      notif.read = true;
      this.pendingUpdates.add(notif.id);
    });
    this.cdr.detectChanges();
    
    unreadNotifications.forEach(notif => {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => {
          this.pendingUpdates.delete(notif.id);
        },
        error: (err) => {
          console.error('Error marcando como leída en lote:', notif.id, err);
          notif.read = false;
          this.pendingUpdates.delete(notif.id);
          this.cdr.detectChanges();
        }
      });
    });
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  notifIcon(type: Notification['type']): string {
    const map: Record<Notification['type'], string> = {
      RENTAL_REQUEST: 'bx-home-alt',
      CONTRACT: 'bx-file',
      PAYMENT: 'bx-credit-card',
      SYSTEM: 'bx-bell'
    };
    return map[type] ?? 'bx-bell';
  }

  notifType(type: Notification['type']): string {
    const map: Record<Notification['type'], string> = {
      RENTAL_REQUEST: 'Solicitud',
      CONTRACT: 'Contrato',
      PAYMENT: 'Pago',
      SYSTEM: 'Sistema'
    };
    return map[type] ?? type;
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (mins < 1) return 'Ahora mismo';
    if (mins < 60) return `Hace ${mins}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  }
}
