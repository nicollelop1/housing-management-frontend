export type RentalRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface RentalRequest {
  requestId:    string;
  propertyId:   { value: string } | string;   
  tenantId:     number;
  ownerId:      number;
  proposedRent: number;
  status:       RentalRequestStatus;
  startDate:    string;
  endDate:      string;
  createdAt:    string;
  respondedAt?: string;
}

export interface CreateRentalRequestPayload {
  propertyId:    string;
  proposedRent?: number;
  startDate:     string;
  endDate:       string;
}

export interface AcceptRequestResponse {
  contractId: string;
}