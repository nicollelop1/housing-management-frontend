import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { CustomValidators } from '../../../shared/components/validators/custom-validators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword {

  form: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, CustomValidators.email]]
    });
  }

  get email() { return this.form.get('email')!; }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.errorMessage = '';

    this.authService.forgotPassword(this.email.value).subscribe({
      next: () => {
        this.authService.recoveryData.email = this.email.value;
        this.router.navigate(['/verify-code']);
      },
      error: () => {
        this.errorMessage = 'Error enviando correo';
      }
    });
  }
}