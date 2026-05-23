export type RentalRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
}

export interface RentalRequest {
  requestId: string;
  propertyId: { value: string };
  tenant: UserSummary; 
  owner: UserSummary;   
  startDate: string;
  endDate: string;
  proposedRent: number | null;
  status: RentalRequestStatus;
  createdAt: string;
  respondedAt: string | null;
  message?: string;
  nextStep?: string;
}

export interface CreateRentalRequestPayload {
  propertyId: string;
  startDate: string;
  duration: number;
  proposedRent?: number | null;

}

export interface AcceptRequestResponse {
  id?: string;
  contractId?: string;
}