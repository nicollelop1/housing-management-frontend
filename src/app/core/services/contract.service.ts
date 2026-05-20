import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contract, CreateContractPayload } from '../models/contract';

@Injectable({ providedIn: 'root' })
export class ContractService {

  private readonly BASE = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) {}

  create(payload: CreateContractPayload): Observable<Contract> {
    return this.http.post<Contract>(this.BASE, payload);
  }

  getById(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.BASE}/${id}`);
  }

  getMyAsOwner(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.BASE}/my/owners`);
  }

  getMyAsTenant(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.BASE}/my/tenants`);
  }

  cancel(id: string): Observable<Contract> {
    return this.http.post<Contract>(`${this.BASE}/${id}/cancel`, {});
  }

  terminate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.BASE}/${id}/pdf`, { responseType: 'blob' });
  }
}