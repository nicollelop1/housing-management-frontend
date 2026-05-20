import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../shared/services/toast';
import { AuthErrors, getHttpErrorMessage } from '../../../core/utils/http-error-handler';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './verify-code.html',
  styleUrls: ['./verify-code.css'],
})
export class VerifyCode {

  private toast  = inject(ToastService);
  private auth   = inject(AuthService);
  private router = inject(Router);

  code: string[] = ['', '', '', '', '', ''];
  submitted    = false;
  errorMessage = '';

  constructor() {
    if (!this.auth.recoveryData.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  get email()           { return this.auth.recoveryData.email; }
  get isCodeComplete()  { return this.code.every(d => d !== ''); }
  get digitsCompleted() { return this.code.filter(d => d !== '').length; }

  trackByIndex(index: number): number { return index; }

  goBack(): void {
    this.router.navigate(['/forgot-password']);
  }

  handleInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    this.code[index] = value ? value[0] : '';
    input.value = this.code[index];

    if (value && index < 5) {
      const next = input.parentElement?.querySelectorAll('.code-input')[index + 1] as HTMLInputElement;
      next?.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !this.code[index] && index > 0) {
      const prev = input.parentElement?.querySelectorAll('.code-input')[index - 1] as HTMLInputElement;
      prev?.focus();
    }
  }

  resendCode(): void {
    this.auth.forgotPassword({ email: this.auth.recoveryData.email }).subscribe({
      next: () => this.toast.info('Código reenviado a tu correo.'),
      error: (err) => this.toast.error(getHttpErrorMessage(err))
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.isCodeComplete) {
      this.errorMessage = 'Completa los 6 dígitos del código.';
      return;
    }

    const payload = {
      email: this.auth.recoveryData.email,
      code:  this.code.join('')
    };

    this.auth.verifyCode(payload).subscribe({
      next: (res) => {
        if (res.valid) {
          this.auth.recoveryData.code = this.code.join('');
          this.router.navigate(['/reset-password']);
        } else {
          this.toast.error(AuthErrors.VERIFY_400);
        }
      },
      error: (err) => {
        this.toast.error(
          err.status === 400 ? AuthErrors.VERIFY_400 : getHttpErrorMessage(err)
        );
      }
    });
  }
}