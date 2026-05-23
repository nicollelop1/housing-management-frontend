import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast';
import { ProfileResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {

  form!: FormGroup;
  profile: ProfileResponse | null = null;

  loading = true;
  saving = false;

  avatarPreview: string | null = null;
  avatarFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.loadProfile());
  }

  ngOnInit(): void {
    this.form = this.buildForm();
  }

  buildForm(): FormGroup {
    return this.fb.group({
      primerNombre: ['', [Validators.required, Validators.maxLength(60)]],
      segundoNombre: ['', Validators.maxLength(60)],
      primerApellido: ['', [Validators.required, Validators.maxLength(60)]],
      segundoApellido: ['', Validators.maxLength(60)],
      edad: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      phoneNumber: ['', Validators.maxLength(20)],
    });
  }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getMe().subscribe({
      next: (data) => {
        this.profile = data;
        this.form.patchValue({
          primerNombre: data.primerNombre ?? '',
          segundoNombre: data.segundoNombre ?? '',
          primerApellido: data.primerApellido ?? '',
          segundoApellido: data.segundoApellido ?? '',
          edad: data.edad ?? null,
          phoneNumber: data.phoneNumber ?? '',
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        const user = this.authService.currentUser;
        if (user) {
          this.profile = user;
          this.form.patchValue({
            primerNombre: user.primerNombre ?? '',
            primerApellido: user.primerApellido ?? '',
            edad: user.edad ?? null,
          });
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }


  get avatarUrl(): string {

    if (this.avatarPreview) {
      return this.avatarPreview;
    }

    return this.profile?.profilePictureUrl ||
      'https://ui-avatars.com/api/?name=L';
  }


  get currentName(): string {
    const v = this.form?.value;
    if (!v) return 'U';
    return [v.primerNombre, v.primerApellido].filter(Boolean).join(' ') || 'U';
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.toast.error('Solo se permiten archivos de imagen (JPG, PNG).');
      return;
    }

    this.avatarFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview = e.target!.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeAvatarPreview(): void {
    this.avatarPreview = null;
    this.avatarFile = null;
  }


  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving = true;
    const v = this.form.value;

    const payload: any = {
      primerNombre: v.primerNombre,
      primerApellido: v.primerApellido,
      edad: v.edad,
    };

    if (v.segundoNombre?.trim()) payload.segundoNombre = v.segundoNombre.trim();
    if (v.segundoApellido?.trim()) payload.segundoApellido = v.segundoApellido.trim();
    if (v.phoneNumber?.trim()) payload.phoneNumber = v.phoneNumber.trim();

    this.profileService.updateMe(payload).subscribe({
      next: (updated) => {
        this.authService.setUser(updated);
        this.profile = updated;
        this.toast.success('¡Perfil actualizado correctamente!');
        this.saving = false;
        this.router.navigate(['/profile/view']);
      },
      error: () => {
        this.toast.error('No se pudo actualizar el perfil. Intenta de nuevo.');
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}