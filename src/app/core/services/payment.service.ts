import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NextPaymentInfo, PaymentHistoryItem, PaymentHistoryResponse } from '../models/payment';
import { map } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class PaymentService {

  private readonly BASE = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  initiate(contractId: string): Observable<{ checkoutUrl: string }> {
    return this.http.post<{ checkoutUrl: string }>(
      `${this.BASE}/initiate/${contractId}`, {}
    );
  }

  payPeriodic(contractId: string): Observable<{ checkoutUrl: string }> {
    return this.http.post<{ checkoutUrl: string }>(
      `${this.BASE}/periodic/${contractId}`, {}
    );
  }


  getHistory(contractId: string): Observable<PaymentHistoryItem[]> {
    return this.http.get<PaymentHistoryResponse>(
      `${this.BASE}/contract/${contractId}/history`
    ).pipe(
      map(res => res.payments)
    );
  }
  getNextPayment(contractId: string): Observable<NextPaymentInfo> {
    return this.http.get<NextPaymentInfo>(
      `${this.BASE}/contract/${contractId}/next-payment`
    );
  }

  downloadReceiptByContract(contractId: string): Observable<Blob> {
    return this.http.get(
      `${this.BASE}/receipt/contract/${contractId}`,
      { responseType: 'blob' }
    );
  }

  downloadReceiptByPayment(paymentId: string): Observable<Blob> {
    return this.http.get(
      `${this.BASE}/receipt/payment/${paymentId}`,
      { responseType: 'blob' }
    );
  }

  downloadHistoryPdf(contractId: string): Observable<Blob> {
    return this.http.get(
      `${this.BASE}/contract/${contractId}/history/pdf`,
      { responseType: 'blob' }
    );
  }

  downloadReceipt(contractId: string): Observable<Blob> {
    return this.downloadReceiptByContract(contractId);
  }
}