import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  VerifyCodeRequest,
  ResetPasswordRequest,
  ProfileResponse
} from '../models/auth.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'token';
const USER_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly AUTH_URL = `${environment.apiUrl}/auth`;
  private readonly PROFILE_URL = `${environment.apiUrl}/profile/me`;

  private currentUserSubject = new BehaviorSubject<ProfileResponse | null>(
    this.loadUserFromStorage()
  );
  currentUser$ = this.currentUserSubject.asObservable();

  recoveryData = { email: '', code: '' };

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.AUTH_URL}/login`, data);
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.AUTH_URL}/register`, data);
  }

  logout(): void {
    this.removeToken();
    this.clearUserFromStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.AUTH_URL}/forgot-password`, data);
  }

  verifyCode(data: VerifyCodeRequest): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.AUTH_URL}/verify-code`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.AUTH_URL}/reset-password`, data);
  }

  handleLoginSuccess(response: LoginResponse): void {

    const token = response.accessToken;

    if (!token) {
      console.error('No accessToken recibido', response);
      return;
    }

    this.setToken(token);

    this.loadProfile();
  }

  handleRegisterSuccess(response: RegisterResponse, payload: RegisterRequest): void {
    this.setToken(response.token);

    const minimalUser: ProfileResponse = {
      id: response.userId,
      primerNombre: payload.primerNombre,
      primerApellido: payload.primerApellido,
      email: response.email,
      edad: payload.edad ?? 0,
      active: true,
      roles: [],
    };

    this.setUser(minimalUser);
  }

  setUser(user: ProfileResponse): void {
    this.currentUserSubject.next(user);
    this.saveUserToStorage(user);
  }

  get currentUser(): ProfileResponse | null {
    return this.currentUserSubject.value;
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }


  private saveUserToStorage(user: ProfileResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  private loadUserFromStorage(): ProfileResponse | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw) as ProfileResponse;
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      const expired = (() => {
        try {
          const p = JSON.parse(atob(token.split('.')[1]));
          return Date.now() > p.exp * 1000;
        } catch { return true; }
      })();
      return expired ? null : user;
    } catch {
      return null;
    }
  }

  private clearUserFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(USER_KEY);
    }
  }

  loadProfile(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const token = this.getToken();
      if (!token) return;

      this.http.get<ProfileResponse>(this.PROFILE_URL).subscribe({
        next: user => this.setUser(user),
        error: err => console.log('Error en profile:', err.status)
      });
    }, 100);
  }
}