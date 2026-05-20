import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AsyncPipe, NgIf, NgFor, NgClass } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../services/toast';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy {
  menuOpen = false;
  notificationsOpen = false;
  currentUser$;

  unreadCount = 0; 
  unreadInDropdownCount = 0;
  notifications: Notification[] = [];
  loadingNotifs = false;

  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.fetchUnreadCount();
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) this.notificationsOpen = false;
  }

  logout(): void {
    this.stopPolling();
    this.authService.logout();
    this.menuOpen = false;
  }

  goToProtected(route: string, label: string): void {
    if (this.isLoggedIn) {
      this.router.navigate([route]);
    } else {
      this.toast.warning(`Necesitas iniciar sesión para acceder a ${label}`);
    }
  }

  toggleNotifications(): void {
    if (!this.isLoggedIn) {
      this.toast.warning('Inicia sesión para ver tus notificaciones');
      return;
    }
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.menuOpen = false;
      this.loadNotifications();
    }
  }

  fetchUnreadCount(): void {
    if (!this.isLoggedIn) return;

    this.notificationService.getUnreadCount().subscribe({
      next: (count) => {
        this.unreadCount = count;
        this.unreadInDropdownCount = count; 
        this.cdr.detectChanges(); 
      },
      error: () => { }
    });
  }

  loadNotifications(): void {
    this.loadingNotifs = true;
    this.notificationService.getAll().subscribe({
      next: (data) => {
        const unread = data.filter(n => !n.read);
        const read = data.filter(n => n.read);

        const sortByDate = (arr: Notification[]) =>
          arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const topRead = sortByDate(read).slice(0, 10);
        const finalList = [...sortByDate(unread), ...topRead];

        this.unreadInDropdownCount = unread.length;
        this.unreadCount = unread.length; 
        this.notifications = finalList;
        this.loadingNotifs = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingNotifs = false;
        this.cdr.detectChanges();
      }
    });
  }

  onNotificationClick(notif: Notification): void {
    this.notificationsOpen = false;

    if (!notif.read) {
      const wasUnread = !notif.read;
      if (wasUnread) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.unreadInDropdownCount = Math.max(0, this.unreadInDropdownCount - 1);
        notif.read = true; 
        this.cdr.detectChanges();
      }

      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => {
          console.log('Notificación marcada como leída:', notif.id);
          this.fetchUnreadCount();
        },
        error: (err) => {
          console.error('Error al marcar como leída:', err);
          if (wasUnread) {
            this.unreadCount = Math.max(0, this.unreadCount + 1);
            this.unreadInDropdownCount = Math.max(0, this.unreadInDropdownCount + 1);
            notif.read = false;
            this.cdr.detectChanges();
          }
        }
      });
    }

    setTimeout(() => {
      if (notif.contractId) {
        this.router.navigate(['/contracts', notif.contractId]);
      } else if (notif.type === 'RENTAL_REQUEST') {
        this.router.navigate(['/rental-requests/owner']);
      }
    }, 100);
  }

  markAllAsRead(): void {
    if (!this.isLoggedIn) return;

    const unreadNotifications = this.notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    const previousUnreadCount = this.unreadCount;
    this.unreadCount = 0;
    this.unreadInDropdownCount = 0;
    this.notifications.forEach(n => n.read = true);
    this.cdr.detectChanges();

    let completed = 0;
    unreadNotifications.forEach(notif => {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => {
          completed++;
          console.log(`Marcada ${completed}/${unreadNotifications.length}`);
          if (completed === unreadNotifications.length) {
            this.fetchUnreadCount();
            this.loadNotifications();
          }
        },
        error: (err) => {
          console.error('Error marcando:', notif.id, err);
          completed++;
          if (completed === unreadNotifications.length) {
            this.fetchUnreadCount();
            this.loadNotifications();
          }
        }
      });
    });
  }

  private startPolling(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.pollInterval = setInterval(() => {
      this.fetchUnreadCount();
    }, 30_000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const inHeader = target.closest('app-header');
    if (!inHeader) {
      this.menuOpen = false;
      this.notificationsOpen = false;
    }
  }

  notifIcon(type: Notification['type']): string {
    const map: Record<Notification['type'], string> = {
      RENTAL_REQUEST: 'bx-home-alt',
      CONTRACT: 'bx-file',
      PAYMENT: 'bx-credit-card',
      SYSTEM: 'bx-bell',
    };
    return map[type] ?? 'bx-bell';
  }

  notifTypeLabel(type: Notification['type']): string {
    const map: Record<Notification['type'], string> = {
      RENTAL_REQUEST: 'Solicitud',
      CONTRACT: 'Contrato',
      PAYMENT: 'Pago',
      SYSTEM: 'Sistema',
    };
    return map[type] ?? type;
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (mins < 1) return 'ahora mismo';
    if (mins < 60) return `hace ${mins}m`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
  }
}