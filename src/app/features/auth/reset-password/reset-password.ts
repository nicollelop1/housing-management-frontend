import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { CustomValidators } from '../../../shared/components/validators/custom-validators';
import { ToastService } from '../../../shared/services/toast';
import { AuthErrors, getHttpErrorMessage } from '../../../core/utils/http-error-handler';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword {

  private toast    = inject(ToastService);
  private fb       = inject(FormBuilder);
  private auth     = inject(AuthService);
  private router   = inject(Router);
  private location = inject(Location);

  form: FormGroup = this.fb.group({
    password: ['', [Validators.required, CustomValidators.strongPassword]]
  });

  loading = false;

  get password() { return this.form.get('password')!; }

  get hasMinLength(): boolean { return (this.password.value?.length ?? 0) >= 8; }
  get hasUpperCase(): boolean { return /[A-Z]/.test(this.password.value ?? ''); }
  get hasNumber():    boolean { return /[0-9]/.test(this.password.value ?? ''); }
  get hasSymbol():    boolean { return /[@$!%*?&]/.test(this.password.value ?? ''); }

  goBack() { this.location.back(); }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;

    const payload = {
      email: this.auth.recoveryData.email,
      code:  this.auth.recoveryData.code,
      newPassword: this.password.value
    };

    this.auth.resetPassword(payload).subscribe({
      next: () => {
        this.toast.success('Contraseña actualizada. Ya puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(
          err.status === 400 ? AuthErrors.RESET_400 : getHttpErrorMessage(err)
        );
      }
    });
  }
}