import { CommonModule, Location } from '@angular/common';
import {
  Component,
  OnInit,
  afterNextRender,
  ChangeDetectorRef
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';

import {
  Property,
  PaymentFrequency,
  PropertyType,
  PropertyStatus
} from '../../../core/models/property.model';
import { RentalService } from '../../../core/services/rental.service';




@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetail implements OnInit {

  property: Property | null = null;

  loading = true;

  selectedImage = '';

  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private rentalService: RentalService,
    private location: Location,
    private cdr: ChangeDetectorRef

  ) {

    afterNextRender(() => {
      this.fetchProperty();
    });

  }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (id) {
        this.fetchProperty();
      }

    });

  }

  private fetchProperty(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.loading = false;

      this.cdr.detectChanges();

      return;

    }

    this.loading = true;

    this.property = null;

    this.cdr.detectChanges();

    this.propertyService.getById(id).subscribe({

      next: (data: Property) => {

        this.property = data;

        this.currentImageIndex = 0;

        this.selectedImage =
          data.imageUrls?.[0] ||
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop';

        this.loading = false;

        this.cdr.detectChanges();

      },

      error: () => {

        this.loading = false;

        this.cdr.detectChanges();

      }

    });

  }

  changeImage(image: string): void {

    this.selectedImage = image;

    if (this.property?.imageUrls?.length) {

      this.currentImageIndex =
        this.property.imageUrls.indexOf(image);

    }

  }

  nextImage(): void {

    if (!this.property?.imageUrls?.length) return;

    const images = this.property.imageUrls;

    this.currentImageIndex =
      (this.currentImageIndex + 1) % images.length;

    this.selectedImage =
      images[this.currentImageIndex];

  }

  prevImage(): void {

    if (!this.property?.imageUrls?.length) return;

    const images = this.property.imageUrls;

    this.currentImageIndex =
      (this.currentImageIndex - 1 + images.length) % images.length;

    this.selectedImage =
      images[this.currentImageIndex];

  }

  hasMultipleImages(): boolean {

    return (this.property?.imageUrls?.length || 0) > 1;

  }

  onImageError(event: Event): void {

    const target = event.target as HTMLImageElement;

    target.src =
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop';

  }

  goBack(): void {
    this.location.back();
  }

  requestRental(): void {

    if (!this.property) return;

    const today = new Date();

    const endDate = new Date();

    endDate.setMonth(endDate.getMonth() + 6);

    const payload = {
      propertyId: this.property.id,
      proposedRent: this.property.priceAmount,
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };


    console.log('PAYLOAD', payload);
    console.log('PROPERTY ID', this.property.id);
    console.log('TYPE ID', typeof this.property.id);

    this.rentalService.create(payload).subscribe({

      next: (response) => {

        console.log('Solicitud creada:', response);

        alert('Solicitud enviada correctamente');

      },

      error: (err) => {

        console.error('ERROR COMPLETO:', err);

        console.log('ERROR BODY:', err.error);

        console.log('MENSAJES:', err.error?.messages);

        alert(JSON.stringify(err.error?.messages));

      }

    });

  }


  formatFrequency(freq: PaymentFrequency): string {

    const map: Record<PaymentFrequency, string> = {
      MONTHLY: 'Mensual',
      BIWEEKLY: 'Quincenal',
      WEEKLY: 'Semanal'
    };

    return map[freq] ?? freq;

  }

  formatType(type: PropertyType): string {

    const map: Record<PropertyType, string> = {
      APARTMENT: 'Apartamento',
      HOUSE: 'Casa',
      ROOM: 'Habitación',
      STUDIO: 'Estudio',
      OFFICE: 'Oficina',
      LAND: 'Terreno'
    };

    return map[type] ?? type;

  }

  formatStatus(status: PropertyStatus): string {

    const map: Record<PropertyStatus, string> = {
      CREATED: 'Creada',
      PUBLISHED: 'Publicada',
      RENTED: 'Arrendada',
      SOLD: 'Vendida',
      DISABLED: 'Desactivada',
      DELETED: 'Eliminada'
    };

    return map[status] ?? status;

  }

}