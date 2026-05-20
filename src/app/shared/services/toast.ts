import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = computed(() => this._toasts());

  private nextId = 0;

  show(message: string, type: ToastType = 'info'): void {
    const id = this.nextId++;
    this._toasts.update(list => [...list, { id, type, message }]);

    const duration = type === 'error' ? 5000 : 4000;
    setTimeout(() => this.remove(id), duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string)   { this.show(message, 'error'); }
  info(message: string)    { this.show(message, 'info'); }
  warning(message: string) { this.show(message, 'warning'); }

  remove(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}