import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RentalRequest,
  CreateRentalRequestPayload,
  AcceptRequestResponse
} from '../models/rental-request.model';

@Injectable({ providedIn: 'root' })
export class RentalService {

  private readonly BASE = `${environment.apiUrl}/rental-requests`;

  constructor(private http: HttpClient) {}

  create(payload: CreateRentalRequestPayload): Observable<RentalRequest> {
    return this.http.post<RentalRequest>(this.BASE, payload);
  }

  getOwnerRequests(): Observable<RentalRequest[]> {
    return this.http.get<RentalRequest[]>(`${this.BASE}/owner`);
  }

  getTenantRequests(): Observable<RentalRequest[]> {
    return this.http.get<RentalRequest[]>(`${this.BASE}/tenant`);
  }

  accept(id: string): Observable<AcceptRequestResponse> {
    return this.http.post<AcceptRequestResponse>(`${this.BASE}/${id}/accept`, {});
  }

  reject(id: string): Observable<void> {
    return this.http.post<void>(`${this.BASE}/${id}/reject`, {});
  }

  cancel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}/cancel`);
  }
}