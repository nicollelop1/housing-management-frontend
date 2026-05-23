import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileResponse } from '../../../core/models/auth.model';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './view-profile.html',
  styleUrl: './view-profile.css',
})
export class ViewProfile implements OnInit {

  profile: ProfileResponse | null = null;
  loading = true;

  readonly FALLBACK_AVATAR = 'https://ui-avatars.com/api/?background=0b254d&color=fff&size=200&bold=true&name=U';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.loadProfile());
  }

  ngOnInit(): void { }

  loadProfile(): void {
    this.loading = true;
    this.profileService.getMe().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.profile = this.authService.currentUser;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get avatarUrl(): string {
    const user = this.profile || this.authService.currentUser;

    if (user?.profilePictureUrl) {
      return user.profilePictureUrl;
    }

    const firstName = user?.primerNombre || '';
    const lastName = user?.primerApellido || '';
    const initial = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';

    return `https://ui-avatars.com/api/?background=0b254d&color=fff&size=200&bold=true&name=${initial}&length=2`;
  }

  get fullName(): string {
    if (!this.profile) return 'Usuario';
    const parts = [
      this.profile.primerNombre,
      this.profile.segundoNombre,
      this.profile.primerApellido,
      this.profile.segundoApellido,
    ].filter(Boolean);
    return parts.join(' ') || 'Usuario';
  }

  goToEdit(): void {
    this.router.navigate(['/profile/edit']);
  }
  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}