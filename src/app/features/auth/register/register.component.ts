import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { CustomValidators } from '../../../shared/components/validators/custom-validators';
import { RegisterRequest, RegisterResponse } from '../../../core/models/auth.model';
import { ToastService } from '../../../shared/services/toast';
import { AuthErrors, getHttpErrorMessage } from '../../../core/utils/http-error-handler';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  private toast    = inject(ToastService);
  private fb       = inject(FormBuilder);
  private auth     = inject(AuthService);
  private router   = inject(Router);
  private location = inject(Location);

  form: FormGroup = this.fb.group({
    primerNombre:    ['', [Validators.required, CustomValidators.onlyLetters]],
    segundoNombre:   ['', [CustomValidators.onlyLetters]],
    primerApellido:  ['', [Validators.required, CustomValidators.onlyLetters]],
    segundoApellido: ['', [CustomValidators.onlyLetters]],
    email:           ['', [Validators.required, CustomValidators.email]],
    cedula:          ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20), CustomValidators.onlyNumbers]],
    edad:            ['', [Validators.required, Validators.min(18), Validators.max(120)]],
    phoneNumber:     ['', [Validators.required, CustomValidators.phoneNumber]],
    password:        ['', [Validators.required, CustomValidators.strongPassword]],
  });

  loading = false;

  get primerNombre()    { return this.form.get('primerNombre')!; }
  get segundoNombre()   { return this.form.get('segundoNombre')!; }
  get primerApellido()  { return this.form.get('primerApellido')!; }
  get segundoApellido() { return this.form.get('segundoApellido')!; }
  get email()           { return this.form.get('email')!; }
  get cedula()          { return this.form.get('cedula')!; }
  get edad()            { return this.form.get('edad')!; }
  get phoneNumber()     { return this.form.get('phoneNumber')!; }
  get password()        { return this.form.get('password')!; }

  get hasMinLength(): boolean { return (this.password.value?.length ?? 0) >= 8; }
  get hasUpperCase(): boolean { return /[A-Z]/.test(this.password.value ?? ''); }
  get hasNumber():    boolean { return /[0-9]/.test(this.password.value ?? ''); }
  get hasSymbol():    boolean { return /[@$!%*?&]/.test(this.password.value ?? ''); }

  goBack(): void { this.location.back(); }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;

    const payload: RegisterRequest = {
      primerNombre:    this.form.value.primerNombre.trim(),
      segundoNombre:   this.form.value.segundoNombre?.trim() || undefined,
      primerApellido:  this.form.value.primerApellido.trim(),
      segundoApellido: this.form.value.segundoApellido?.trim() || undefined,
      email:           this.form.value.email.trim().toLowerCase(),
      cedula:          this.form.value.cedula.trim(),
      edad:            Number(this.form.value.edad),
      phoneNumber:     this.form.value.phoneNumber.trim(),
      password:        this.form.value.password,
    };

    this.auth.register(payload).subscribe({
      next: (response: RegisterResponse) => {
        if (response?.token) {
          this.auth.handleRegisterSuccess(response, payload);
          this.toast.success(`¡Bienvenido, ${payload.primerNombre}!`);
          this.router.navigate(['/home']);
        } else {
          this.toast.success('Cuenta creada. Ya puedes iniciar sesión.');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(
          err.status === 409 ? AuthErrors.REGISTER_409 :
          err.status === 400 ? AuthErrors.REGISTER_400 :
          getHttpErrorMessage(err)
        );
      }
    });
  }
}
