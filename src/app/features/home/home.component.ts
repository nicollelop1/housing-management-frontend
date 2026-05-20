import { Component, OnInit, afterNextRender, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property, PropertyFilters, PropertyType } from '../../core/models/property.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  properties: Property[] = [];
  loading = false;
  isSearching = false;

  filters: PropertyFilters = {
    city: '',
    minPrice: undefined,
    maxPrice: undefined,
    typeProperty: undefined,
    bedrooms: undefined,
    petsAllowed: undefined,
    furnished: undefined
  };

  propertyTypes: PropertyType[] = ['APARTMENT', 'HOUSE', 'ROOM', 'STUDIO', 'OFFICE', 'LAND'];

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    afterNextRender(() => {
      setTimeout(() => this.loadProperties(), 300);
    });
  }

  ngOnInit(): void { }

  loadProperties(): void {
    this.loading = true;
    this.isSearching = false;
    this.cdr.detectChanges();

    this.propertyService.getAll(0, 20).subscribe({
      next: (data) => {
        this.properties = data.content || data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando propiedades:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  searchProperties(): void {
    const hasFilters =
      !!this.filters.city?.trim() ||
      this.filters.typeProperty !== undefined ||
      this.filters.bedrooms !== undefined ||
      this.filters.minPrice !== undefined ||
      this.filters.maxPrice !== undefined ||
      this.filters.petsAllowed !== undefined ||
      this.filters.furnished !== undefined;

    if (!hasFilters) {
      this.loadProperties();
      return;
    }

    this.loading = true;
    this.isSearching = true;
    this.cdr.detectChanges();

    this.propertyService.search(this.filters).subscribe({
      next: (data) => {
        this.properties = data.content || data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearFilters(): void {
    this.filters = {
      city: '',
      minPrice: undefined,
      maxPrice: undefined,
      typeProperty: undefined,
      bedrooms: undefined,
      petsAllowed: undefined,
      furnished: undefined
    };
    this.loadProperties();
  }

  getMainImage(property: any): string {
    if (!property.imageUrls?.length) {
      return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600';
    }
    return String(property.imageUrls[0]).trim();
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600';
  }

  formatType(type: string): string {
    const map: Record<string, string> = {
      APARTMENT: 'Apartamento', HOUSE: 'Casa', ROOM: 'Habitación',
      STUDIO: 'Estudio', OFFICE: 'Oficina', LAND: 'Terreno'
    };
    return map[type] ?? type;
  }

  scrollCarousel(direction: 'left' | 'right'): void {
    const container = document.getElementById('propertyCarousel');
    if (!container) return;
    const card = container.querySelector('.property-card') as HTMLElement;
    if (!card) return;
    const gap = parseInt(window.getComputedStyle(card).marginRight || '0');
    container.scrollBy({
      left: direction === 'left' ? -(card.offsetWidth + gap) * 3 : (card.offsetWidth + gap) * 3,
      behavior: 'smooth'
    });
  }
}