import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, RouterLink],
  templateUrl: './verify-code.html',
  styleUrls: ['./verify-code.css'],
})
export class VerifyCode implements OnInit {
  code: string[] = ['', '', '', '', '', ''];
  email: string = 'test@email.com';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      const savedEmail = localStorage.getItem('recoveryEmail');

      if (savedEmail) {
        this.email = savedEmail;
      }
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  handleInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    const char = value.slice(-1);

    if (char && /^[0-9]$/.test(char)) {
      this.code[index] = char;

      if (index < 5) {
        const nextInput = input.nextElementSibling as HTMLInputElement;
        nextInput?.focus();
      }
    } else {
      this.code[index] = '';
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (!this.code[index] && index > 0) {
        const prevInput = input.previousElementSibling as HTMLInputElement;
        prevInput?.focus();
      } else {
        this.code[index] = '';
      }
    }
  }

  resendCode() {
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.errorMessage = 'Código reenviado';
      },
      error: () => {
        this.errorMessage = 'Error al reenviar código';
      }
    });
  }
  onSubmit() {
    const fullCode = this.code.join('');

    if (fullCode.length < 6) {
      this.errorMessage = 'Por favor ingresa el código completo.';
      return;
    }

    this.errorMessage = '';

    this.authService.verifyCode({
      email: this.email,
      code: fullCode
    }).subscribe({
      next: (response) => {
        if (response.valid) {
          localStorage.setItem('recoveryCode', fullCode);
          this.router.navigate(['/reset-password']);
        } else {
          this.errorMessage = 'El código es incorrecto.';
        }
      },
      error: () => {
        this.errorMessage = 'Error al verificar. El código pudo expirar.';
      }
    });
  }
}