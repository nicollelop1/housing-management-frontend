import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { RentalService } from '../../../core/services/rental.service';
import { ToastService } from '../../../shared/services/toast';
import { RentalRequest, RentalRequestStatus } from '../../../core/models/rental-request.model';
import { getHttpErrorMessage, RentalErrors } from '../../../core/utils/http-error-handler';

@Component({
  selector: 'app-tenant-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tenant-requests.html',
  styleUrl: './tenant-requests.css',
})
export class TenantRequests implements OnInit {

  requests: RentalRequest[] = [];
  loading = true;

  cancelTargetId: string | null = null;
  cancelling = false;

  activeFilter: RentalRequestStatus | 'ALL' = 'ALL';

  filters: { key: RentalRequestStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Todas' },
    { key: 'PENDING', label: 'Pendientes' },
    { key: 'ACCEPTED', label: 'Aceptadas' },
    { key: 'REJECTED', label: 'Rechazadas' },
    { key: 'CANCELLED', label: 'Canceladas' },
  ];

  constructor(
    private rentalService: RentalService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }


  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.rentalService.getTenantRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(getHttpErrorMessage(err));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredRequests(): RentalRequest[] {
    if (this.activeFilter === 'ALL') return this.requests;
    return this.requests.filter(r => r.status === this.activeFilter);
  }

  setFilter(filter: RentalRequestStatus | 'ALL'): void {
    this.activeFilter = filter;
  }

  countByStatus(status: RentalRequestStatus | 'ALL'): number {
    if (status === 'ALL') return this.requests.length;
    return this.requests.filter(r => r.status === status).length;
  }

  askCancel(id: string): void {
    this.cancelTargetId = id;
  }

  cancelDialog(): void {
    this.cancelTargetId = null;
  }

  confirmCancel(): void {
    if (!this.cancelTargetId || this.cancelling) return;
    this.cancelling = true;
    this.cdr.detectChanges();

    this.rentalService.cancel(this.cancelTargetId).subscribe({
      next: () => {
        this.toast.info('Solicitud cancelada.');
        this.cancelTargetId = null;
        this.cancelling = false;
        this.loadRequests();
      },
      error: (err) => {
        this.toast.error(
          err.status === 400 ? RentalErrors.CANCEL_400 : getHttpErrorMessage(err)
        );
        this.cancelling = false;
        this.cancelTargetId = null;
        this.cdr.detectChanges();
      }
    });
  }

  goToProperty(req: RentalRequest): void {
    const pid = this.getPropertyId(req);
    if (pid) this.router.navigate(['/properties-detail', pid]);
  }

  getPropertyId(req: RentalRequest): string {
    const pid = req.propertyId;
    return typeof pid === 'object' ? (pid as { value: string }).value : pid;
  }

  formatStatus(status: RentalRequestStatus): string {
    const map: Record<RentalRequestStatus, string> = {
      PENDING: 'Pendiente',
      ACCEPTED: 'Aceptada',
      REJECTED: 'Rechazada',
      CANCELLED: 'Cancelada',
    };
    return map[status] ?? status;
  }

  statusClass(status: RentalRequestStatus): string {
    const map: Record<RentalRequestStatus, string> = {
      PENDING: 'status-pending',
      ACCEPTED: 'status-accepted',
      REJECTED: 'status-rejected',
      CANCELLED: 'status-cancelled',
    };
    return map[status] ?? '';
  }

  statusIcon(status: RentalRequestStatus): string {
    const map: Record<RentalRequestStatus, string> = {
      PENDING: 'bx-time',
      ACCEPTED: 'bx-check-circle',
      REJECTED: 'bx-x-circle',
      CANCELLED: 'bx-minus-circle',
    };
    return map[status] ?? 'bx-circle';
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(amount);
  }
}