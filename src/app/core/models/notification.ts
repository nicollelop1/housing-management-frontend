export type NotificationType = 'RENTAL_REQUEST' | 'CONTRACT' | 'PAYMENT' | 'SYSTEM';

export interface Notification {
  id:          string;
  type:        NotificationType;
  title:       string;
  message:     string;
  read:        boolean;
  contractId?: string;
  createdAt:   string;
}