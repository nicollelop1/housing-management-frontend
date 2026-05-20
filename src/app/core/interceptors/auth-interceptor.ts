import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { ToastService } from '../../shared/services/toast';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId)) {
    if (req.url.includes('/profile/me')) {
      return throwError(() => new Error('SSR: skip profile'));
    }
    return next(req);
  }

  const token = authService.getToken();

  const isPublicAuth =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/verify-code') ||
    req.url.includes('/auth/reset-password');

  const extraHeaders: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true'
  };

  if (!isPublicAuth && token) {
    extraHeaders['Authorization'] = `Bearer ${token}`;
  }

  const authReq = req.clone({ setHeaders: extraHeaders });

  if (isPublicAuth) {
    return next(authReq);
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const isAuthRequest =
          err.url?.includes('/auth/login') ||
          err.url?.includes('/auth/register') ||
          err.url?.includes('/auth/forgot-password') ||
          err.url?.includes('/auth/verify-code') ||
          err.url?.includes('/auth/reset-password');

        if (!isAuthRequest && authService.getToken()) {
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          toastService.warning('Tu sesión expiró. Inicia sesión de nuevo.');
          router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    })
  );
};