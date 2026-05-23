import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { RentalService } from '../../../core/services/rental.service';
import { ToastService } from '../../../shared/services/toast';
import { RentalRequest, RentalRequestStatus } from '../../../core/models/rental-request.model';
import { getHttpErrorMessage, RentalErrors } from '../../../core/utils/http-error-handler';

@Component({
  selector: 'app-owner-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './owner-requests.html',
  styleUrl: './owner-requests.css',
})
export class OwnerRequests implements OnInit {

  requests: RentalRequest[] = [];
  loading = true;
  actionId: string | null = null;

  rejectTargetId: string | null = null;
  rejecting = false;

  activeFilter: RentalRequestStatus | 'ALL' = 'ALL';

  filters: { key: RentalRequestStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Todas' },
    { key: 'PENDING', label: 'Pendientes' },
    { key: 'ACCEPTED', label: 'Aceptadas' },
    { key: 'REJECTED', label: 'Rechazadas' },
    { key: 'CANCELLED', label: 'Canceladas' }
  ];

  constructor(
    private rentalService: RentalService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.loadRequests());
  }

  ngOnInit(): void { }


  loadRequests(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.rentalService.getOwnerRequests().subscribe({
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
  countByStatus(status: string): number {
    if (!this.requests) return 0;
    if (status === 'ALL') return this.requests.length;
    return this.requests.filter(req => req.status === status).length;
  }

  accept(req: RentalRequest): void {
    if (this.actionId) return;
    this.actionId = req.requestId;
    this.cdr.detectChanges();

    this.rentalService.accept(req.requestId).subscribe({

      next: (res) => {

        this.toast.success(
          'Solicitud aceptada. Contrato creado automáticamente.'
        );

        this.actionId = null;

        this.loadRequests();

        this.cdr.detectChanges();

        if (res?.contractId) {

          this.router.navigate([
            '/contracts',
            res.contractId
          ]);

        }

      },

      error: (err) => {

        this.toast.error(
          err.status === 403
            ? RentalErrors.ACCEPT_403
            : getHttpErrorMessage(err)
        );

        this.actionId = null;

        this.cdr.detectChanges();

      }

    });
  }


  askReject(id: string): void {
    this.rejectTargetId = id;
  }

  cancelReject(): void {
    this.rejectTargetId = null;
  }

  confirmReject(): void {
    if (!this.rejectTargetId || this.rejecting) return;
    this.rejecting = true;
    this.cdr.detectChanges();

    this.rentalService.reject(this.rejectTargetId).subscribe({
      next: () => {
        this.toast.info('Solicitud rechazada.');
        this.rejectTargetId = null;
        this.rejecting = false;
        this.loadRequests();
      },
      error: (err) => {
        this.toast.error(
          err.status === 403 ? RentalErrors.REJECT_403 : getHttpErrorMessage(err)
        );
        this.rejecting = false;
        this.rejectTargetId = null;
        this.cdr.detectChanges();
      }
    });
  }

  getPropertyId(req: RentalRequest): string {
    if (req.propertyId && req.propertyId.value) {
      return req.propertyId.value;
    }
    return '';
  }
  isActing(id: string): boolean {
    return this.actionId === id;
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