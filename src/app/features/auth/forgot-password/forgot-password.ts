import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword {

  email: string = '';
  errorMessage = '';

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {}

  isEmailValid(): boolean {
    return this.emailRegex.test(this.email);
  }

  goBack() {
    this.location.back();
  }

  onSubmit(form: NgForm) {

    form.control.markAllAsTouched();

    if (form.invalid || !this.isEmailValid()) return;

    this.errorMessage = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {

        localStorage.setItem('recoveryEmail', this.email);

        this.router.navigate(['/verify-code']);
      },
      error: () => {
        this.errorMessage = 'Error enviando correo';
      }
    });
  }
}