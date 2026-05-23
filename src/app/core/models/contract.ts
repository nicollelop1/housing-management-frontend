export type ContractStatus = 'PAYMENT_PENDING' | 'CANCELLATION_PENDING' | 'ACTIVE' | 'TERMINATED' | 'CANCELLED' | 'EXPIRED' | 'PAID_NOT_STARTED';
export type PaymentFrequency = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

export interface Contract {
  id?: string;
  contractId?: string;

  propertyId: string;
  propertyTitle: string;

  tenantId: number;
  tenantName: string;
  tenantCedula?: string;

  ownerId: number;
  ownerName: string;
  ownerCedula?: string;

  startDate: string;
  endDate: string;

  periodRent: number;

  paymentFrequency: PaymentFrequency;
  status: ContractStatus;
  createdAt: string;
}

export function getContractId(contract: Contract): string {
  return contract.id ?? contract.contractId ?? '';
}

export interface CreateContractPayload {
  propertyId: string;
  tenantId: number;
  startDate: string;
  endDate: string;
  periodRent: number;
  paymentFrequency: PaymentFrequency;
}