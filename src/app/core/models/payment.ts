export interface InitiatePaymentResponse {
  checkoutUrl: string;
}

export interface PaymentHistoryItem {
  paymentId: string;
  amount: number;
  status: string;
  paidAt: string;
  period: string | null;
}

export interface PaymentHistoryResponse {
  contractId: string;
  propertyTitle: string;
  periodRent: number;
  nextPaymentDueDate: string;
  payments: PaymentHistoryItem[];
}

export interface NextPaymentInfo {
  contractId: string;
  propertyTitle: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  paymentFrequency: string;
  isOverdue: boolean;
  canPayNextPeriod: boolean;
  nextPeriodDescription: string;
  nextPeriodAmount: number;
}