import {
  Component, OnInit, afterNextRender, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { ContractService }     from '../../../core/services/contract.service';
import { PaymentService }      from '../../../core/services/payment.service';
import { ToastService }        from '../../../shared/services/toast';
import { getHttpErrorMessage } from '../../../core/utils/http-error-handler';
import { Contract, getContractId } from '../../../core/models/contract';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payments.html',
  styleUrl:    './payments.css',
})
export class Payments implements OnInit {

  contracts: Contract[] = [];
  loading = true;
  downloadingId: string | null = null;

  constructor(
    private contractService: ContractService,
    private paymentService:  PaymentService,
    private router:          Router,
    private toast:           ToastService,
    private cdr:             ChangeDetectorRef,
  ) {
    afterNextRender(() => this.load());
  }

  ngOnInit(): void {}

  private load(): void {
    this.loading = true;

    let ownerContracts:  Contract[] = [];
    let tenantContracts: Contract[] = [];
    let done = 0;

    const finish = () => {
      done++;
      if (done < 2) return;

      const allIds = new Set<string>();
      const all: Contract[] = [];
      for (const c of [...ownerContracts, ...tenantContracts]) {
        const id = getContractId(c);
        if (!allIds.has(id)) {
          allIds.add(id);
          all.push(c);
        }
      }

      this.contracts = all
        .filter(c => c.status !== 'PAYMENT_PENDING')
        .sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      this.loading = false;
      this.cdr.detectChanges();
    };

    this.contractService.getMyAsOwner().subscribe({
      next:  (d) => { ownerContracts = d; finish(); },
      error: ()  => { finish(); }
    });

    this.contractService.getMyAsTenant().subscribe({
      next:  (d) => { tenantContracts = d; finish(); },
      error: ()  => { finish(); }
    });
  }

  goToHistory(contract: Contract): void {
    this.router.navigate(['/payments', getContractId(contract), 'history']);
  }

  downloadLastReceipt(contract: Contract, event: Event): void {
    event.stopPropagation();
    const id = getContractId(contract);
    if (this.downloadingId) return;
    this.downloadingId = id;
    this.cdr.detectChanges();

    this.paymentService.downloadReceiptByContract(id).subscribe({
      next: (blob) => {
        this.triggerDownload(blob, `comprobante_${id}.pdf`);
        this.downloadingId = null;
        this.toast.success('Comprobante descargado.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.downloadingId = null;
        this.toast.error(
          err.status === 400
            ? 'No hay comprobante disponible para este contrato aún.'
            : getHttpErrorMessage(err)
        );
        this.cdr.detectChanges();
      }
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  getId(c: Contract): string { return getContractId(c); }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      PAID_NOT_STARTED:     'Pagado – no iniciado',
      ACTIVE:               'Activo',
      CANCELLATION_PENDING: 'Cancelación pendiente',
      TERMINATED:           'Terminado',
      CANCELLED:            'Cancelado',
      EXPIRED:              'Expirado',
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PAID_NOT_STARTED:     'status-paid-not-started',
      ACTIVE:               'status-active',
      CANCELLATION_PENDING: 'status-cancellation-pending',
      TERMINATED:           'status-terminated',
      CANCELLED:            'status-cancelled',
      EXPIRED:              'status-expired',
    };
    return map[status] ?? '';
  }

  formatFrequency(freq: string): string {
    return ({ MONTHLY: 'Mensual', BIWEEKLY: 'Quincenal', WEEKLY: 'Semanal' } as any)[freq] ?? freq;
  }

  formatCurrency(n: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0
    }).format(n);
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: '2-digit'
    });
  }
}