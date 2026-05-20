import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { CustomValidators } from '../../../shared/components/validators/custom-validators';
import { ToastService } from '../../../shared/services/toast';
import { AuthErrors, getHttpErrorMessage } from '../../../core/utils/http-error-handler';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, CustomValidators.email]],
    password: ['', [Validators.required, CustomValidators.strongPassword]]
  });

  loading = false;

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  get hasMinLength(): boolean { return (this.password.value?.length ?? 0) >= 8; }
  get hasUpperCase(): boolean { return /[A-Z]/.test(this.password.value ?? ''); }
  get hasNumber(): boolean { return /[0-9]/.test(this.password.value ?? ''); }
  get hasSymbol(): boolean { return /[@$!%*?&]/.test(this.password.value ?? ''); }

  goBack(): void { this.location.back(); }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;

    this.auth.login(this.form.value).subscribe({
      next: (response) => {
        this.auth.handleLoginSuccess(response);
        this.toast.success('¡Bienvenido de nuevo!');
        this.router.navigate(['/home']).then(() => {
        this.auth.loadProfile();
        });
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(
          err.status === 401 ? AuthErrors.LOGIN_401 : getHttpErrorMessage(err)
        );
      }
    });
  }
}
