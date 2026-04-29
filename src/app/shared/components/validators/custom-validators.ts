import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {

  static email(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(value) ? null : { invalidEmail: true };
  }


  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    if (value.length < 8)          return { weakPassword: 'minLength' };
    if (!/[A-Z]/.test(value))      return { weakPassword: 'uppercase' };
    if (!/[0-9]/.test(value))      return { weakPassword: 'number' };
    if (!/[@$!%*?&]/.test(value))  return { weakPassword: 'symbol' };

    return null;
  }


  static onlyNumbers(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    return /^[0-9]+$/.test(value) ? null : { onlyNumbers: true };
  }


  static verificationCode(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    return /^[0-9]{6}$/.test(value) ? null : { invalidCode: true };
  }

  static passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const password     = group.get('newPassword')?.value;
    const confirmation = group.get('confirmPassword')?.value;

    if (!password || !confirmation) return null;

    return password === confirmation ? null : { passwordsMismatch: true };
  }

  static textLength(min: number, max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();
      if (!value) return null;

      if (value.length < min) return { textTooShort: { min, actual: value.length } };
      if (value.length > max) return { textTooLong:  { max, actual: value.length } };

      return null;
    };
  }

  static exactDigits(length: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const regex = new RegExp(`^[0-9]{${length}}$`);
      return regex.test(value)
        ? null
        : { exactDigits: { required: length, actual: value.length } };
    };
  }

  static onlyLetters(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null; 
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value) ? null : { onlyLetters: true };
}

 
static phoneNumber(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  return /^[0-9]{10}$/.test(value) ? null : { invalidPhone: true };
}
}