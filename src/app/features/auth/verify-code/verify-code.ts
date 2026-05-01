import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, RouterLink],
  templateUrl: './verify-code.html',
  styleUrls: ['./verify-code.css'],
})
export class VerifyCode implements OnInit {

  code: string[] = ['', '', '', '', '', ''];
  email: string = '';
  errorMessage = '';
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.email = this.authService.recoveryData.email;

    if (!this.email) {
      this.router.navigate(['/forgot-password']);

    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  get isCodeComplete(): boolean {
    return /^[0-9]{6}$/.test(this.code.join(''));
  }

  get digitsCompleted(): number {
    return this.code.filter(d => d !== '').length;
  }

  handleInput(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    const char = input.value.slice(-1);

    if (char && /^[0-9]$/.test(char)) {
      this.code[index] = char;
      if (index < 5) {
        const nextInput = input.nextElementSibling as HTMLInputElement;
        nextInput?.focus();
      }
    } else {
      this.code[index] = '';
      input.value = '';
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
        this.errorMessage = 'Código reenviado a tu correo';
      },
      error: () => {
        this.errorMessage = 'Error al reenviar código';
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    if (!this.isCodeComplete) {
      this.errorMessage = 'Ingresa los 6 dígitos del código';
      return;
    }

    this.errorMessage = '';

    this.authService.verifyCode({ email: this.email, code: this.code.join('') }).subscribe({
      next: (response) => {
        console.log(response); 

        const finalCode = this.code.join('');

        this.authService.recoveryData = {
          email: this.email,
          code: finalCode
        };

        localStorage.setItem('recoveryData', JSON.stringify({
          email: this.email,
          code: finalCode
        }));

        this.router.navigate(['/reset-password']);
      },

      error: () => {
        this.errorMessage = 'Error al verificar. El código pudo haber expirado';
      }
    });
  }
}