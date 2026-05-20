import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { CustomValidators } from '../../../shared/components/validators/custom-validators';
import { ToastService } from '../../../shared/services/toast';
import { AuthErrors, getHttpErrorMessage } from '../../../core/utils/http-error-handler';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css'],
})
export class ForgotPassword {

  private toast  = inject(ToastService);
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, CustomValidators.email]]
  });

  get email() { return this.form.get('email')!; }

  goBack() { 
    this.router.navigate(['/login']); 
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.auth.forgotPassword({ email: this.email.value }).subscribe({
      next: () => {
        this.auth.recoveryData.email = this.email.value;
        this.toast.info('Código enviado a tu correo.');
        this.router.navigate(['/verify-code']);
      },
      error: (err) => {
        this.toast.error(
          err.status === 404 ? AuthErrors.FORGOT_404 : getHttpErrorMessage(err)
        );
      }
    });
  }
}