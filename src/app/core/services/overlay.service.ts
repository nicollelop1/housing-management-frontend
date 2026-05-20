import { Injectable, Signal, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { inject } from '@angular/core';
import { filter } from 'rxjs/operators';

const OVERLAY_ROUTES = [
  'login',
  'register',
  'forgot-password',
  'verify-code',
  'reset-password',
];

@Injectable({ providedIn: 'root' })
export class OverlayService {
  private router = inject(Router);
  private currentUrl = signal(this.router.url);

  readonly isOverlayRoute: Signal<boolean> = computed(() =>
    OVERLAY_ROUTES.some(route => this.currentUrl().includes(route))
  );

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.currentUrl.set((e as NavigationEnd).urlAfterRedirects));
  }
}