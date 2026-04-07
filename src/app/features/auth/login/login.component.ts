import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) { }

  goBack() {
    this.location.back();
  }

  isEmailValid(): boolean {
    return this.emailRegex.test(this.email);
  }

  onSubmit(form: NgForm) {

    form.control.markAllAsTouched();

    if (form.invalid || !this.isEmailValid()) {
      return;
    }

    this.errorMessage = '';

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {

        this.authService.setToken(response.token);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.errorMessage = 'Credenciales incorrectas';
      }
    });
  }
}