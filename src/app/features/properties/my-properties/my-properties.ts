import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertyStatus } from '../../../core/models/property.model';
import { ToastService } from '../../../shared/services/toast';

@Component({
  selector: 'app-my-properties',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-properties.html',
  styleUrl: './my-properties.css',
})
export class MyProperties implements OnInit {

  properties: Property[] = [];
  loading = true;
  confirmDeleteId: string | null = null;
  deleting = false;
  openMenuId: string | null = null;

  readonly PLACEHOLDER = 'assets/img/property-placeholder.png';
  readonly FALLBACK_URL = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80';

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.load());
  }

  ngOnInit(): void {}

  load(): void {
    this.loading = true;
    this.propertyService.getMyProperties(0, 50).subscribe({
      next: (data) => {
        this.properties = data.content || data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getMainImage(p: Property): string {
    const urls = p.imageUrls?.filter(u => u && u.trim() !== '');
    return urls?.[0] ?? this.FALLBACK_URL;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.FALLBACK_URL) {
      img.src = this.FALLBACK_URL;
    }
  }

  canPublish(p: Property): boolean {
    return p.status === 'CREATED' || p.status === 'DISABLED';
  }

  canDelete(p: Property): boolean {
    return p.status !== 'RENTED' && p.status !== 'SOLD';
  }

  formatStatus(status: PropertyStatus): string {
    const map: Record<PropertyStatus, string> = {
      CREATED:   'Borrador',
      PUBLISHED: 'Publicada',
      RENTED:    'Arrendada',
      SOLD:      'Vendida',
      DISABLED:  'Desactivada',
      DELETED:   'Eliminada',
    };
    return map[status] ?? status;
  }

  statusClass(status: PropertyStatus): string {
    const map: Record<PropertyStatus, string> = {
      CREATED:   'status-draft',
      PUBLISHED: 'status-published',
      RENTED:    'status-rented',
      SOLD:      'status-sold',
      DISABLED:  'status-disabled',
      DELETED:   'status-deleted',
    };
    return map[status] ?? '';
  }

  statusIcon(status: PropertyStatus): string {
    const map: Record<PropertyStatus, string> = {
      CREATED:   'bx-edit',
      PUBLISHED: 'bx-check-circle',
      RENTED:    'bx-home-heart',
      SOLD:      'bx-dollar-circle',
      DISABLED:  'bx-hide',
      DELETED:   'bx-trash',
    };
    return map[status] ?? 'bx-circle';
  }

  formatType(type: string): string {
    const map: Record<string, string> = {
      APARTMENT: 'Apartamento', HOUSE: 'Casa', ROOM: 'Habitación',
      STUDIO: 'Estudio', OFFICE: 'Oficina', LAND: 'Terreno'
    };
    return map[type] ?? type;
  }


  publishProperty(id: string, event: Event): void {
    event.stopPropagation();
    this.propertyService.publish(id).subscribe({
      next: () => {
        this.toast.success('Propiedad publicada correctamente.');
        const prop = this.properties.find(p => p.id === id);
        if (prop) prop.status = 'PUBLISHED';
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('Error al publicar la propiedad.');
      }
    });
  }

  askDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = null;
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(): void {
    if (!this.confirmDeleteId) return;
    this.deleting = true;
    this.propertyService.delete(this.confirmDeleteId).subscribe({
      next: () => {
        this.toast.success('Propiedad eliminada correctamente.');
        this.properties = this.properties.filter(p => p.id !== this.confirmDeleteId);
        this.confirmDeleteId = null;
        this.deleting = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error('No se pudo eliminar la propiedad.');
        this.deleting = false;
        this.confirmDeleteId = null;
      }
    });
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  goToDetail(id: string): void {
    this.openMenuId = null;
    this.router.navigate(['/properties-detail', id]);
  }

  goToEdit(id: string): void {
    this.openMenuId = null;
    this.router.navigate(['/edit-property', id]);
  }
}