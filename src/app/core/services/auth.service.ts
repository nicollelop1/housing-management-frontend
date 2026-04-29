import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private API_URL = `${environment.apiUrl}/auth`;

  recoveryData = {
    email: '',
    code: ''
  };

  constructor(private http: HttpClient) { }

  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, data);
  }

  register(data: RegisterRequest) {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.API_URL}/forgot-password`, { email });
  }

  verifyCode(data: { email: string, code: string }) {
    return this.http.post<any>(`${this.API_URL}/verify-code`, data);
  }

  resetPassword(data: { email: string; code: string; newPassword: string }) {
    return this.http.post(`${this.API_URL}/reset-password`, data);
  }

}