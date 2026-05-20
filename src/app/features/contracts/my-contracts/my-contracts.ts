
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ContractService } from '../../../core/services/contract.service';
import { Contract } from '../../../core/models/contract';
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

  ownerContracts: Contract[] = [];
  tenantContracts: Contract[] = [];

  activeTab: 'OWNER' | 'TENANT' = 'OWNER';

  loadingOwner = true;
  loadingTenant = true;

  ngOnInit(): void {
    this.loadOwnerContracts();
    this.loadTenantContracts();
  }

  loadOwnerContracts(): void {
    this.loadingOwner = true;

    this.contractService.getMyAsOwner().subscribe({
      next: (contracts) => {
        this.ownerContracts = contracts;
        this.loadingOwner = false;
      },
      error: (err) => {
        this.loadingOwner = false;
        this.toast.error(getHttpErrorMessage(err));
      }
    });
  }

  loadTenantContracts(): void {
    this.loadingTenant = true;

    this.contractService.getMyAsTenant().subscribe({
      next: (contracts) => {
        this.tenantContracts = contracts;
        this.loadingTenant = false;
      },
      error: (err) => {
        this.loadingTenant = false;
        this.toast.error(getHttpErrorMessage(err));
      }
    });
  }

  setTab(tab: 'OWNER' | 'TENANT'): void {
    this.activeTab = tab;
  }

  goToDetail(contractId: string): void {
    this.router.navigate(['/contracts', contractId]);
  }

  downloadPdf(contractId: string): void {
    this.contractService.downloadPdf(contractId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${contractId}.pdf`;
        a.click();

        window.URL.revokeObjectURL(url);

        this.toast.success('PDF descargado correctamente');
      },
      error: (err) => {
        this.toast.error(getHttpErrorMessage(err));
      }
    });
  }

  cancelContract(contractId: string): void {

    const confirmed = confirm('¿Deseas cancelar este contrato?');

    if (!confirmed) return;

    this.contractService.cancel(contractId).subscribe({
      next: () => {
        this.toast.success('Contrato cancelado');

        this.loadOwnerContracts();
        this.loadTenantContracts();
      },
      error: (err) => {
        this.toast.error(getHttpErrorMessage(err));
      }
    });
  }

  getContracts(): Contract[] {
    return this.activeTab === 'OWNER'
      ? this.ownerContracts
      : this.tenantContracts;
  }

  isLoading(): boolean {
    return this.activeTab === 'OWNER'
      ? this.loadingOwner
      : this.loadingTenant;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'active';

      case 'CANCELLED':
        return 'cancelled';

      case 'TERMINATED':
        return 'terminated';

      case 'EXPIRED':
        return 'expired';

      default:
        return '';
    }
  }
}
