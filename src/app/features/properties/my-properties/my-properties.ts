import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { Property, PropertyStatus } from '../../../core/models/property.model';
import { ToastService } from '../../../shared/services/toast';

type FilterStatus = 'ALL' | 'PUBLISHED' | 'CREATED' | 'RENTED' | 'DISABLED' | 'DELETED';

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

  activeFilter: FilterStatus = 'ALL';

  readonly FALLBACK_URL = 'https://salvamentomaritimo.es/assets/images/placeholder-image.png';

  readonly filterTabs: { label: string; value: FilterStatus; icon: string }[] = [
    { label: 'Todas',       value: 'ALL',      icon: 'bx-list-ul'       },
    { label: 'Publicadas',  value: 'PUBLISHED', icon: 'bx-check-circle'  },
    { label: 'Borradores',  value: 'CREATED',   icon: 'bx-edit'          },
    { label: 'Arrendadas',  value: 'RENTED',    icon: 'bx-home-heart'    },
  ];

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.load());
  }

  ngOnInit(): void {}

  setFilter(filter: FilterStatus): void {
    if (this.activeFilter === filter) return;
    this.activeFilter = filter;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.cdr.detectChanges();

    const status = this.activeFilter === 'ALL' ? undefined : this.activeFilter;

    this.propertyService.getMyProperties(0, 50, status).subscribe({
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
    if (img.src !== this.FALLBACK_URL) img.src = this.FALLBACK_URL;
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
      STUDIO: 'Estudio', OFFICE: 'Oficina', LAND: 'Terreno',
    };
    return map[type] ?? type;
  }

  togglePublish(property: Property, event: Event): void {
    event.stopPropagation();
    const isPublished = property.status === 'PUBLISHED';
    const request$ = isPublished
      ? this.propertyService.disable(property.id)
      : this.propertyService.publish(property.id);

    request$.subscribe({
      next: () => {
        property.status = isPublished ? 'DISABLED' : 'PUBLISHED';
        this.toast.success(isPublished
          ? 'Propiedad despublicada correctamente.'
          : 'Propiedad publicada correctamente.');
        if (this.activeFilter !== 'ALL') this.load();
        else this.cdr.detectChanges();
      },
      error: () => this.toast.error(isPublished
        ? 'Error al despublicar la propiedad.'
        : 'Error al publicar la propiedad.')
    });
  }

  askDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = null;
    const prop = this.properties.find(p => p.id === id);
    if (prop && !this.canDelete(prop)) {
      this.toast.error(prop.status === 'RENTED'
        ? 'No se puede eliminar la propiedad porque tiene un contrato de arriendo vigente.'
        : 'No se puede eliminar una propiedad que ya ha sido vendida.');
      return;
    }
    this.confirmDeleteId = id;
  }

  cancelDelete(): void { this.confirmDeleteId = null; }

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

  closeMenu(): void { this.openMenuId = null; }

  goToDetail(id: string): void {
    this.openMenuId = null;
    this.router.navigate(['/properties-detail', id]);
  }

  goToEdit(id: string): void {
    this.openMenuId = null;
    this.router.navigate(['/edit-property', id]);
  }
}