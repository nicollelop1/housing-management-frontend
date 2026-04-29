import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { CustomValidators } from '../../../shared/components/validators/custom-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, CustomValidators.email]],
      password: ['', [Validators.required, CustomValidators.strongPassword]]
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  get hasMinLength(): boolean { return (this.password.value?.length ?? 0) >= 8; }
  get hasUpperCase(): boolean { return /[A-Z]/.test(this.password.value ?? ''); }
  get hasNumber():    boolean { return /[0-9]/.test(this.password.value ?? ''); }
  get hasSymbol():    boolean { return /[@$!%*?&]/.test(this.password.value ?? ''); }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.errorMessage = '';
    this.loading = true;

    this.authService.login(this.form.value).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Credenciales incorrectas';
      }
    });
  }
}