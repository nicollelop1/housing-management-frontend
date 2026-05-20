import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ContractService } from '../../../core/services/contract.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast';
import { Contract, ContractStatus } from '../../../core/models/contract';
import { getHttpErrorMessage } from '../../../core/utils/http-error-handler';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contract-detail.html',
  styleUrl: './contract-detail.css',
})
export class ContractDetail implements OnInit {

  contract: Contract | null = null;
  loading = true;
  contractId = '';

  
  downloadingPdf = false;
  initiatingPayment = false;
  downloadingReceipt = false;

  
  showCancelModal = false;
  cancelling = false;

  
  showTerminateModal = false;
  terminating = false;

  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.load());
  }

  ngOnInit(): void {
    this.contractId = this.route.snapshot.paramMap.get('id') ?? '';
    this.currentUserId = this.authService.currentUser?.id ?? null;
  }

  load(): void {
    if (!this.contractId) {
      this.router.navigate(['/contracts']);
      return;
    }
    this.loading = true;
    this.cdr.detectChanges();

    this.contractService.getById(this.contractId).subscribe({
      next: (c) => {
        this.contract = c;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(getHttpErrorMessage(err));
        this.loading = false;
        this.cdr.detectChanges();
        if (err.status === 404) this.router.navigate(['/contracts']);
      }
    });
  }

  get isOwner(): boolean {
    return !!this.contract && this.contract.ownerId === this.currentUserId;
  }

  get isTenant(): boolean {
    return !!this.contract && this.contract.tenantId === this.currentUserId;
  }

  get isActive(): boolean {
    return this.contract?.status === 'ACTIVE';
  }

  downloadPdf(): void {
    if (this.downloadingPdf) return;
    this.downloadingPdf = true;
    this.cdr.detectChanges();

    this.contractService.downloadPdf(this.contractId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato_${this.contractId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingPdf = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('No se pudo descargar el contrato. ' + getHttpErrorMessage(err));
        this.downloadingPdf = false;
        this.cdr.detectChanges();
      }
    });
  }

  initiatePayment(): void {
    if (this.initiatingPayment) return;
    this.initiatingPayment = true;
    this.cdr.detectChanges();

    this.paymentService.initiate(this.contractId).subscribe({
      next: (res) => {
        window.location.href = res.checkoutUrl;
      },
      error: (err) => {
        this.toast.error('No se pudo iniciar el pago. ' + getHttpErrorMessage(err));
        this.initiatingPayment = false;
        this.cdr.detectChanges();
      }
    });
  }

  downloadReceipt(): void {
    if (this.downloadingReceipt) return;
    this.downloadingReceipt = true;
    this.cdr.detectChanges();

    this.paymentService.downloadReceipt(this.contractId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobante_${this.contractId}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingReceipt = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.status === 400
          ? 'Aún no hay un pago completado para este contrato.'
          : getHttpErrorMessage(err);
        this.toast.error(msg);
        this.downloadingReceipt = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCancelModal(): void  { this.showCancelModal = true; }
  closeCancelModal(): void { this.showCancelModal = false; }

  confirmCancel(): void {
    if (this.cancelling) return;
    this.cancelling = true;
    this.cdr.detectChanges();

    this.contractService.cancel(this.contractId).subscribe({
      next: (updated) => {
        this.contract = updated;
        this.toast.info('Contrato cancelado.');
        this.showCancelModal = false;
        this.cancelling = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error(getHttpErrorMessage(err));
        this.cancelling = false;
        this.showCancelModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  openTerminateModal(): void  { this.showTerminateModal = true; }
  closeTerminateModal(): void { this.showTerminateModal = false; }

  confirmTerminate(): void {
    if (this.terminating) return;
    this.terminating = true;
    this.cdr.detectChanges();

    this.contractService.terminate(this.contractId).subscribe({
      next: () => {
        this.toast.success('Contrato terminado correctamente.');
        this.showTerminateModal = false;
        this.terminating = false;
        this.router.navigate(['/contracts']);
      },
      error: (err) => {
        this.toast.error(getHttpErrorMessage(err));
        this.terminating = false;
        this.showTerminateModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatStatus(status: ContractStatus): string {
    const map: Record<ContractStatus, string> = {
      ACTIVE:     'Activo',
      TERMINATED: 'Terminado',
      CANCELLED:  'Cancelado',
      EXPIRED:    'Expirado',
    };
    return map[status] ?? status;
  }

  statusClass(status: ContractStatus): string {
    const map: Record<ContractStatus, string> = {
      ACTIVE:     'status-active',
      TERMINATED: 'status-terminated',
      CANCELLED:  'status-cancelled',
      EXPIRED:    'status-expired',
    };
    return map[status] ?? '';
  }

  formatFrequency(freq: string): string {
    const map: Record<string, string> = {
      MONTHLY:   'Mensual',
      BIWEEKLY:  'Quincenal',
      WEEKLY:    'Semanal',
    };
    return map[freq] ?? freq;
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(amount);
  }
}