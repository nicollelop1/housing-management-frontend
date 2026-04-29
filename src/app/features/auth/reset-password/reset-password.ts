import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf, isPlatformBrowser } from '@angular/common';
import { CustomValidators } from '../../../shared/components/validators/custom-validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
})
export class ResetPassword implements OnInit {

  form: FormGroup;
  errorMessage = '';
  successMessage = '';

  email: string = '';
  code: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group(
      {
        newPassword: ['', [Validators.required, CustomValidators.strongPassword]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: CustomValidators.passwordsMatch }
    );
  }

  ngOnInit() {
    this.email = this.authService.recoveryData.email;
    this.code = this.authService.recoveryData.code;

    if (!this.email || !this.code) {
      this.router.navigate(['/forgot-password']);
    }
  }
  
  get newPassword() { return this.form.get('newPassword')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  get hasMinLength(): boolean { return (this.newPassword.value?.length ?? 0) >= 8; }
  get hasUpperCase(): boolean { return /[A-Z]/.test(this.newPassword.value ?? ''); }
  get hasNumber(): boolean { return /[0-9]/.test(this.newPassword.value ?? ''); }
  get hasSymbol(): boolean { return /[@$!%*?&]/.test(this.newPassword.value ?? ''); }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.errorMessage = '';

    this.authService.resetPassword({
      email: this.email,
      code: this.code,
      newPassword: this.newPassword.value
    }).subscribe({
      next: () => {
        this.authService.recoveryData = { email: '', code: '' };
        this.successMessage = 'Contraseña actualizada correctamente';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.errorMessage = 'Error al restablecer la contraseña. El código pudo expirar.';
      }
    });
  }
}