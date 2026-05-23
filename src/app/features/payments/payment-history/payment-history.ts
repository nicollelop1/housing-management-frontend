import {
  Component, OnInit, afterNextRender,
  ChangeDetectorRef, PLATFORM_ID, inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PaymentService }      from '../../../core/services/payment.service';
import { ContractService }     from '../../../core/services/contract.service';
import { ToastService }        from '../../../shared/services/toast';
import { getHttpErrorMessage } from '../../../core/utils/http-error-handler';
import { PaymentHistoryItem }  from '../../../core/models/payment';
import { Contract, getContractId } from '../../../core/models/contract';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-history.html',
  styleUrl:    './payment-history.css',
})
export class PaymentHistory implements OnInit {

  contractId = '';
  contract: Contract | null = null;
  payments:  PaymentHistoryItem[] = [];

  loading         = true;
  loadingContract = true;
  downloadingPdf  = false;
  downloadingId: string | null = null;

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private paymentService: PaymentService,
    private contractService: ContractService,
    private toast:          ToastService,
    private cdr:            ChangeDetectorRef,
  ) {
    afterNextRender(() => this.load());
  }

  ngOnInit(): void {
    this.contractId = this.route.snapshot.paramMap.get('contractId') ?? '';
  }

  private load(): void {
    if (!this.contractId) {
      this.loading = false;
      this.loadingContract = false;
      return;
    }

    this.contractService.getById(this.contractId).subscribe({
      next: (c) => {
        this.contract = c;
        this.loadingContract = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingContract = false;
        this.cdr.detectChanges();
      }
    });

    this.paymentService.getHistory(this.contractId).subscribe({
      next: (data) => {
        this.payments = [...data].sort(
          (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
        );
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toast.error('No se pudo cargar el historial. ' + getHttpErrorMessage(err));
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  downloadReceipt(paymentId: string): void {
    if (!isPlatformBrowser(this.platformId) || this.downloadingId) return;
    this.downloadingId = paymentId;
    this.cdr.detectChanges();

    this.paymentService.downloadReceiptByPayment(paymentId).subscribe({
      next: (blob) => {
        this.triggerDownload(blob, `comprobante_${paymentId}.pdf`);
        this.downloadingId = null;
        this.toast.success('Comprobante descargado.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.downloadingId = null;
        this.toast.error(
          err.status === 404
            ? 'No se encontró el comprobante para este pago.'
            : getHttpErrorMessage(err)
        );
        this.cdr.detectChanges();
      }
    });
  }

  downloadHistoryPdf(): void {
    if (!isPlatformBrowser(this.platformId) || this.downloadingPdf) return;
    this.downloadingPdf = true;
    this.cdr.detectChanges();

    this.paymentService.downloadHistoryPdf(this.contractId).subscribe({
      next: (blob) => {
        this.triggerDownload(blob, `historial_pagos_${this.contractId}.pdf`);
        this.downloadingPdf = false;
        this.toast.success('Historial descargado.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.downloadingPdf = false;
        this.toast.error(getHttpErrorMessage(err));
        this.cdr.detectChanges();
      }
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  get totalPaid(): number {
    return this.payments.reduce((acc, p) => acc + p.amount, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(amount);
  }

  formatDate(date: string): string {
    if (!date) return '—';
    const d = new Date(date);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric', month: 'long', day: '2-digit'
    }).format(d);
  }

  formatShortDate(date: string): string {
    if (!date) return '—';
    const d = new Date(date);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(d);
  }

  goToContract(): void {
    this.router.navigate(['/contracts', this.contractId]);
  }

  goToContracts(): void {
    this.router.navigate(['/contracts']);
  }
}