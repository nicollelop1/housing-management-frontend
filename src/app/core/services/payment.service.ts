import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InitiatePaymentResponse } from '../models/payment';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  private readonly BASE = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  initiate(contractId: string): Observable<InitiatePaymentResponse> {
    return this.http.post<InitiatePaymentResponse>(
      `${this.BASE}/initiate/${contractId}`, {}
    );
  }

  downloadReceipt(contractId: string): Observable<Blob> {
    return this.http.get(`${this.BASE}/receipt/${contractId}`, {
      responseType: 'blob'
    });
  }
}