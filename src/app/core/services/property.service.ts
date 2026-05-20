import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Property,
  PropertyFilters,
  CreatePropertyRequest
} from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyService {

  private readonly BASE = `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) { }

  getAll(page = 0, size = 10): Observable<any> {
    return this.http.get<any>(this.BASE, {
      params: { page, size }
    });
  }

  getById(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.BASE}/${id}`);
  }

  search(filters: PropertyFilters): Observable<any> {
    let params = new HttpParams();

    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });

    return this.http.get<any>(`${this.BASE}/search`, { params });
  }

  getImages(id: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.BASE}/${id}/images`);
  }

  getMyProperties(page = 0, size = 10, status?: string): Observable<any> {
    let params: any = { page, size };
    if (status) params['status'] = status;
    return this.http.get<Property[]>(`${this.BASE}/my-properties`, { params });
  }

  create(formData: FormData): Observable<Property> {
    return this.http.post<Property>(this.BASE, formData);
  }

  update(id: string, formData: FormData): Observable<Property> {
    return this.http.patch<Property>(`${this.BASE}/${id}`, formData);
  }

  publish(id: string): Observable<void> {
    return this.http.patch<void>(`${this.BASE}/${id}/publish`, {});
  }

  disable(id: string): Observable<void> {
    return this.http.patch<void>(`${this.BASE}/${id}/disable`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  uploadImages(id: string, formData: FormData): Observable<string[]> {
    return this.http.post<string[]>(`${this.BASE}/${id}/images`, formData);
  }

  deleteImage(id: string, url: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}/images`, {
      params: { url }
    });
  }
}