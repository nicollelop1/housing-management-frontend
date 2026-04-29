import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { CustomValidators } from '../../../shared/components/validators/custom-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

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
      primerNombre:    ['', [Validators.required, CustomValidators.onlyLetters]],
      segundoNombre:   ['', [CustomValidators.onlyLetters]],
      primerApellido:  ['', [Validators.required, CustomValidators.onlyLetters]],
      segundoApellido: ['', [CustomValidators.onlyLetters]],
      email:           ['', [Validators.required, CustomValidators.email]],
      cedula:          ['', [Validators.required, CustomValidators.onlyNumbers]],
      edad:            ['', [Validators.required, Validators.min(18), Validators.max(120)]],
      phoneNumber:     ['', [Validators.required, CustomValidators.phoneNumber]],
      password:        ['', [Validators.required, CustomValidators.strongPassword]],
    });
  }

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

  goBack() {
    this.location.back();
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.errorMessage = '';
    this.loading = true;

    const payload = {
      primerNombre:    this.form.value.primerNombre.trim(),
      segundoNombre:   this.form.value.segundoNombre?.trim() ?? '',
      primerApellido:  this.form.value.primerApellido.trim(),
      segundoApellido: this.form.value.segundoApellido?.trim() ?? '',
      email:           this.form.value.email.trim().toLowerCase(),
      cedula:          this.form.value.cedula.trim(),
      edad:            Number(this.form.value.edad),
      phoneNumber:     this.form.value.phoneNumber.trim(),
      password:        this.form.value.password,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.errorMessage = 'El correo o cédula ya están registrados';
        } else {
          this.errorMessage = 'Error al registrarse, intenta de nuevo';
        }
      }
    });
  }
}