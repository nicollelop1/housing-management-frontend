import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { PropertyService } from '../../../core/services/property.service';
import { RentalService } from '../../../core/services/rental.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast';
import { getHttpErrorMessage, RentalErrors } from '../../../core/utils/http-error-handler';
import {
  Property, PaymentFrequency, PropertyType, PropertyStatus
} from '../../../core/models/property.model';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetail implements OnInit {

  property: Property | null = null;
  loading = true;
  requesting = false;

  selectedImage = '';
  currentImageIndex = 0;

  showRequestPanel = false;
  form = {
    startDate: new Date().toISOString().split('T')[0],
    duration: 6,
    proposedRent: null as number | null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private rentalService: RentalService,
    private authService: AuthService,
    private toast: ToastService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) { this.loading = false; return; }
      this.fetchProperty(id);
    });
  }

  private fetchProperty(id: string): void {
    this.loading = true;
    this.propertyService.getById(id).subscribe({
      next: (data) => {
        this.property = data;
        this.selectedImage = data.imageUrls?.[0] ||
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600';
        this.currentImageIndex = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        this.property = null;
        this.cdr.detectChanges();
      }
    });
  }

  get currentUserId(): number | null {
    return this.authService.currentUser?.id ?? null;
  }

  get isOwner(): boolean {
    if (!this.property || !this.currentUserId) return false;
    return Number(this.property.owner?.id) === Number(this.currentUserId);
  }

  get isLoggedIn(): boolean {
    return !!this.authService.currentUser;
  }


  openRequestPanel(): void {
    this.form = {
      startDate: new Date().toISOString().split('T')[0],
      duration: this.property?.paymentFrequency === 'WEEKLY' ? 4 : 6,
      proposedRent: null,
    };
    this.showRequestPanel = true;
    this.cdr.detectChanges();
  }

  closeRequestPanel(): void {
    this.showRequestPanel = false;
    this.cdr.detectChanges();
  }

  submitRequest(): void {
    if (!this.property || this.requesting) return;
    this.requesting = true;
    this.cdr.detectChanges();

    const payload = {
      propertyId: this.property.id,
      startDate: this.form.startDate,
      duration: this.form.duration,
      proposedRent: this.form.proposedRent || null,
    };

    this.rentalService.create(payload).subscribe({
      next: () => {
        this.toast.success('¡Solicitud enviada correctamente!');
        this.requesting = false;
        this.showRequestPanel = false;
        this.cdr.detectChanges();
        this.router.navigate(['/rental-requests/tenant']);
      },
      error: (err) => {
        const msg = err.status === 409 ? RentalErrors.REQUEST_409
          : err.status === 403 ? RentalErrors.REQUEST_403
            : getHttpErrorMessage(err);
        this.toast.error(msg);
        this.requesting = false;
        this.cdr.detectChanges();
      }
    });
  }

  changeImage(image: string): void {
    this.selectedImage = image;
    if (this.property?.imageUrls?.length)
      this.currentImageIndex = this.property.imageUrls.indexOf(image);
  }

  nextImage(): void {
    if (!this.property?.imageUrls?.length) return;
    const imgs = this.property.imageUrls;
    this.currentImageIndex = (this.currentImageIndex + 1) % imgs.length;
    this.selectedImage = imgs[this.currentImageIndex];
  }

  prevImage(): void {
    if (!this.property?.imageUrls?.length) return;
    const imgs = this.property.imageUrls;
    this.currentImageIndex = (this.currentImageIndex - 1 + imgs.length) % imgs.length;
    this.selectedImage = imgs[this.currentImageIndex];
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600';
  }

  goBack(): void { this.location.back(); }

  formatFrequency(freq: PaymentFrequency | null | undefined): string {
    if (!freq) return '—';
    const map: Record<PaymentFrequency, string> = {
      MONTHLY: 'Mensual', BIWEEKLY: 'Quincenal', WEEKLY: 'Semanal'
    };
    return map[freq] ?? freq;
  }

  formatType(type: PropertyType): string {
    const map: Record<PropertyType, string> = {
      APARTMENT: 'Apartamento', HOUSE: 'Casa', ROOM: 'Habitación',
      STUDIO: 'Estudio', OFFICE: 'Oficina', LAND: 'Terreno'
    };
    return map[type] ?? type;
  }

  formatStatus(status: PropertyStatus): string {
    const map: Record<PropertyStatus, string> = {
      CREATED: 'Creada', PUBLISHED: 'Publicada', RENTED: 'Arrendada',
      SOLD: 'Vendida', DISABLED: 'Desactivada', DELETED: 'Eliminada'
    };
    return map[status] ?? status;
  }
}