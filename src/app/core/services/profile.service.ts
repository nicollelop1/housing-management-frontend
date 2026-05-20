import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileResponse, UpdateProfileRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {

private readonly PROFILE_URL = `${environment.apiUrl}/profile/me`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.PROFILE_URL);
  }

  updateMe(data: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(this.PROFILE_URL, data);
  }
}