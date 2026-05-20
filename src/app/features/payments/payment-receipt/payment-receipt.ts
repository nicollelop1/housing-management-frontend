import { Component, OnInit, afterNextRender, ChangeDetectorRef, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PaymentService } from '../../../core/services/payment.service';
import { ToastService }   from '../../../shared/services/toast';
import { getHttpErrorMessage } from '../../../core/utils/http-error-handler';

type PageState = 'loading' | 'ready' | 'error' | 'downloading';

@Component({
  selector: 'app-payment-receipt',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-receipt.html',
  styleUrl:    './payment-receipt.css',
})
export class PaymentReceipt implements OnInit {

  contractId = '';
  state: PageState = 'loading';
  errorMsg = '';

  receiptReady  = false;
  downloadingPdf = false;

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private paymentService: PaymentService,
    private toast:          ToastService,
    private cdr:            ChangeDetectorRef,
  ) {
    afterNextRender(() => this.init());
  }

  ngOnInit(): void {
    this.contractId = this.route.snapshot.paramMap.get('contractId') ?? '';
  }


  private init(): void {
    if (!this.contractId) {
      this.state    = 'error';
      this.errorMsg = 'No se encontró el ID del contrato en la URL.';
      this.cdr.detectChanges();
      return;
    }
    this.state = 'ready';
    this.cdr.detectChanges();
  }


  downloadReceipt(): void {
    if (this.downloadingPdf || !isPlatformBrowser(this.platformId)) return;
    this.downloadingPdf = true;
    this.cdr.detectChanges();

    this.paymentService.downloadReceipt(this.contractId).subscribe({
      next: (blob: Blob) => {
        this.triggerBlobDownload(blob, `comprobante_${this.contractId}.pdf`);
        this.downloadingPdf = false;
        this.receiptReady   = true;
        this.toast.success('Comprobante descargado correctamente.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.downloadingPdf = false;

        if (err.status === 400) {
          this.toast.warning('El pago de este contrato aún no se ha completado. No hay comprobante disponible.');
        } else if (err.status === 404) {
          this.toast.error('No se encontró el comprobante para este contrato.');
        } else {
          this.toast.error(getHttpErrorMessage(err));
        }

        this.cdr.detectChanges();
      }
    });
  }

  private triggerBlobDownload(blob: Blob, filename: string): void {
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


  goToContract(): void {
    this.router.navigate(['/contracts', this.contractId]);
  }

  goToContracts(): void {
    this.router.navigate(['/contracts']);
  }
}