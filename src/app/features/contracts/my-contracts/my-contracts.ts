import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ContractService } from '../../../core/services/contract.service';
import { Contract, ContractStatus, getContractId } from '../../../core/models/contract';
import { ToastService } from '../../../shared/services/toast';
import { getHttpErrorMessage } from '../../../core/utils/http-error-handler';

@Component({
  selector: 'app-my-contracts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-contracts.html',
  styleUrls: ['./my-contracts.css']
})
export class MyContractsComponent implements OnInit {

  private contractService = inject(ContractService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ownerContracts: Contract[] = [];
  tenantContracts: Contract[] = [];

  activeTab: 'OWNER' | 'TENANT' = 'OWNER';

  ownerLoaded = false;
  tenantLoaded = false;
  loadingOwner = false;
  loadingTenant = false;
  currentModeLabel = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      this.activeTab = tab === 'tenant' ? 'TENANT' : 'OWNER';
      this.currentModeLabel = this.activeTab === 'OWNER' ? 'Como propietario' : 'Como arrendatario';

      if (this.activeTab === 'OWNER') {
        if (!this.ownerLoaded) this.loadOwnerContracts();
      } else {
        if (!this.tenantLoaded) this.loadTenantContracts();
      }

      this.cdr.detectChanges();
    });
  }

  loadOwnerContracts(): void {
    if (this.ownerLoaded) return;
    this.loadingOwner = true;
    this.cdr.detectChanges();

    this.contractService.getMyAsOwner().subscribe({
      next: (contracts) => {
        this.ownerContracts = contracts;
        this.loadingOwner = false;
        this.ownerLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingOwner = false;
        this.ownerLoaded = true;
        this.toast.error(getHttpErrorMessage(err));
        this.cdr.detectChanges();
      }
    });
  }

  loadTenantContracts(): void {
    if (this.tenantLoaded) return;
    this.loadingTenant = true;
    this.cdr.detectChanges();

    this.contractService.getMyAsTenant().subscribe({
      next: (contracts) => {
        this.tenantContracts = contracts;
        this.loadingTenant = false;
        this.tenantLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingTenant = false;
        this.tenantLoaded = true;
        this.toast.error(getHttpErrorMessage(err));
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'OWNER' | 'TENANT'): void {
    this.activeTab = tab;
    if (tab === 'OWNER' && !this.ownerLoaded) this.loadOwnerContracts();
    if (tab === 'TENANT' && !this.tenantLoaded) this.loadTenantContracts();
  }

  refreshTab(): void {
    if (this.activeTab === 'OWNER') {
      this.ownerLoaded = false;
      this.loadOwnerContracts();
    } else {
      this.tenantLoaded = false;
      this.loadTenantContracts();
    }
  }

  isLoading(): boolean { return this.activeTab === 'OWNER' ? this.loadingOwner : this.loadingTenant; }
  getContracts(): Contract[] { return this.activeTab === 'OWNER' ? this.ownerContracts : this.tenantContracts; }
  getId(contract: Contract): string { return getContractId(contract); }

  goToDetail(contract: Contract): void {
    this.router.navigate(['/contracts', getContractId(contract)]);
  }

  downloadPdf(contract: Contract): void {
    const id = getContractId(contract);
    this.contractService.downloadPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('PDF descargado correctamente');
      },
      error: (err) => this.toast.error(getHttpErrorMessage(err))
    });
  }

  cancelContract(contract: Contract): void {
    const id = getContractId(contract);
    this.contractService.cancel(id).subscribe({
      next: () => {
        this.toast.success('Contrato cancelado');
        this.ownerLoaded = false;
        this.tenantLoaded = false;
        this.loadOwnerContracts();
        this.loadTenantContracts();
      },
      error: (err) => this.toast.error(getHttpErrorMessage(err))
    });
  }


  formatStatus(status: string): string {
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

  formatFrequency(freq: string): string {
    const map: Record<string, string> = {
      MONTHLY: 'Mensual',
      BIWEEKLY: 'Quincenal',
      WEEKLY: 'Semanal',
    };
    return map[freq] ?? freq;
  }

  getStatusClass(status: string): string {
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

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      PAYMENT_PENDING: 'bx-time',
      PAID_NOT_STARTED: 'bx-hourglass',
      ACTIVE: 'bx-check-circle',
      CANCELLATION_PENDING: 'bx-alarm',
      TERMINATED: 'bx-flag',
      CANCELLED: 'bx-x-circle',
      EXPIRED: 'bx-alarm-off',
    };
    return map[status] ?? 'bx-circle';
  }

  canShowCancel(status: string): boolean {
    return status === 'PAYMENT_PENDING' || status === 'ACTIVE';
  }

  cancelLabel(status: string): string {
    return status === 'PAYMENT_PENDING' ? 'Cancelar' : 'Solicitar cancelación';
  }
}