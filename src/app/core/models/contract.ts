export type ContractStatus = 'ACTIVE' | 'TERMINATED' | 'CANCELLED' | 'EXPIRED';
export type PaymentFrequency = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

export interface Contract {
  contractId:       string;
  propertyId:       string;
  propertyTitle:    string;
  tenantId:         number;
  tenantName:       string;
  ownerId:          number;
  ownerName:        string;
  startDate:        string;
  endDate:          string;
  monthlyRent:      number;
  paymentFrequency: PaymentFrequency;
  status:           ContractStatus;
  createdAt:        string;
}

export interface CreateContractPayload {
  propertyId:       string;
  tenantId:         number;
  startDate:        string;
  endDate:          string;
  monthlyRent:      number;
  paymentFrequency: PaymentFrequency;
}