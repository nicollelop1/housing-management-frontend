import { Component, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { ToastService, Toast } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent {
  protected toast = inject(ToastService);

  getIcon(type: Toast['type']): string {
    const icons: Record<Toast['type'], string> = {
      success: 'bx-check-circle',
      error:   'bx-x-circle',
      warning: 'bx-error',
      info:    'bx-info-circle'
    };
    return icons[type];
  }
}