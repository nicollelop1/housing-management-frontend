import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ContractService } from '../../../core/services/contract.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast';
import { Contract, ContractStatus, getContractId } from '../../../core/models/contract';
import { NextPaymentInfo } from '../../../core/models/payment';
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

  nextPayment: NextPaymentInfo | null = null;
  loadingNextPayment = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.contractId = this.route.snapshot.paramMap.get('id') ?? '';
    this.currentUserId = this.authService.currentUser?.id ?? null;
    this.load();
  }

  load(): void {
    if (!this.contractId) return;

    this.loading = true;
    this.nextPayment = null;

    this.contractService.getById(this.contractId).subscribe({
      next: (c) => {
        this.contract = c;
        this.loading = false;
        this.cdr.detectChanges();

        if (c.status === 'ACTIVE') {
          this.loadNextPayment();
        }
      },
      error: (err) => {
        console.log('ERROR CONTRATO:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadNextPayment(): void {
    this.loadingNextPayment = true;

    this.paymentService.getNextPayment(this.contractId).subscribe({
      next: (info) => {
        this.nextPayment = info;
        this.loadingNextPayment = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingNextPayment = false;
        this.cdr.detectChanges();
      }
    });
  }

  get isOwner(): boolean { return !!this.contract && this.contract.ownerId === this.currentUserId; }
  get isTenant(): boolean { return !!this.contract && this.contract.tenantId === this.currentUserId; }

  get isPaymentPending(): boolean { return this.contract?.status === 'PAYMENT_PENDING'; }
  get isPaidNotStarted(): boolean { return this.contract?.status === 'PAID_NOT_STARTED'; }
  get isActive(): boolean { return this.contract?.status === 'ACTIVE'; }
  get isCancellationPending(): boolean { return this.contract?.status === 'CANCELLATION_PENDING'; }
  get isTerminated(): boolean { return this.contract?.status === 'TERMINATED'; }
  get isCancelled(): boolean { return this.contract?.status === 'CANCELLED'; }
  get isExpired(): boolean { return this.contract?.status === 'EXPIRED'; }

  get canPayInitial(): boolean {
    return this.isTenant && this.isPaymentPending;
  }

  get canPayPeriodic(): boolean {
    return this.isTenant && this.isActive && (this.nextPayment?.canPayNextPeriod === true);
  }

  get canShowCancelButton(): boolean {
    return this.isPaymentPending || this.isActive;
  }

  get isImmediateCancel(): boolean {
    return this.isPaymentPending;
  }

  get cancelModalConfig(): { title: string; body: string; btnLabel: string } {
    if (this.isImmediateCancel) {
      return {
        title: '¿Cancelar contrato?',
        body: 'El contrato aún no ha sido pagado. Se cancelará de inmediato y ambas partes serán notificadas.',
        btnLabel: 'Sí, cancelar'
      };
    }
    return {
      title: '¿Solicitar cancelación?',
      body: 'Se iniciará un proceso de cancelación. El contrato permanecerá activo durante 1 mes antes de cancelarse definitivamente.',
      btnLabel: 'Sí, solicitar cancelación'
    };
  }

  initiatePayment(): void {
    if (this.initiatingPayment) return;
    this.initiatingPayment = true;
    this.cdr.detectChanges();

    this.paymentService.initiate(this.contractId).subscribe({
      next: (res) => { window.location.href = res.checkoutUrl; },
      error: (err) => {
        this.toast.error('No se pudo iniciar el pago. ' + getHttpErrorMessage(err));
        this.initiatingPayment = false;
        this.cdr.detectChanges();
      }
    });
  }

  periodicPayment(): void {
    if (this.initiatingPayment) return;
    this.initiatingPayment = true;
    this.cdr.detectChanges();

    this.paymentService.payPeriodic(this.contractId).subscribe({
      next: (res) => { window.location.href = res.checkoutUrl; },
      error: (err) => {
        this.toast.error('No se pudo procesar el pago. ' + getHttpErrorMessage(err));
        this.initiatingPayment = false;
        this.cdr.detectChanges();
      }
    });
  }

  downloadPdf(): void {
    if (this.downloadingPdf) return;
    this.downloadingPdf = true;
    this.cdr.detectChanges();

    this.contractService.downloadPdf(this.contractId).subscribe({
      next: (blob) => {
        this.triggerDownload(blob, `contrato_${this.contractId}.pdf`);
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

  downloadReceipt(): void {
    if (this.downloadingReceipt) return;
    this.downloadingReceipt = true;
    this.cdr.detectChanges();

    this.paymentService.downloadReceiptByContract(this.contractId).subscribe({
      next: (blob) => {
        this.triggerDownload(blob, `comprobante_${this.contractId}.pdf`);
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

  openCancelModal(): void { this.showCancelModal = true; }
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

  openTerminateModal(): void { this.showTerminateModal = true; }
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


  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  formatStatus(status: ContractStatus | string): string {
    const map: Record<string, string> = {
      PAYMENT_PENDING: 'Pago pendiente',
      PAID_NOT_STARTED: 'Pagado – no iniciado',
      ACTIVE: 'Activo',
      CANCELLATION_PENDING: 'Cancelación pendiente',
      TERMINATED: 'Terminado',
      CANCELLED: 'Cancelado',
      EXPIRED: 'Expirado',
    };
    return map[status] ?? status;
  }

  statusClass(status: ContractStatus | string): string {
    const map: Record<string, string> = {
      PAYMENT_PENDING: 'status-pending',
      PAID_NOT_STARTED: 'status-paid-not-started',
      ACTIVE: 'status-active',
      CANCELLATION_PENDING: 'status-cancellation-pending',
      TERMINATED: 'status-terminated',
      CANCELLED: 'status-cancelled',
      EXPIRED: 'status-expired',
    };
    return map[status] ?? '';
  }

  formatFrequency(freq: string): string {
    const map: Record<string, string> = {
      MONTHLY: 'Mensual',
      BIWEEKLY: 'Quincenal',
      WEEKLY: 'Semanal',
    };
    return map[freq] ?? freq;
  }

  formatDate(date: any): string {
    if (!date) return '—';
    const parts = date.split('T')[0].split('-');
    if (parts.length !== 3) return '—';
    const [y, m, d] = parts;
    const safeDate = new Date(Number(y), Number(m) - 1, Number(d));
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: 'long', day: '2-digit'
    }).format(safeDate);
  }

  formatCurrency(amount: number | string | null | undefined): string {
    const value = Number(amount ?? 0);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }
}