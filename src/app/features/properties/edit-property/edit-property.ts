import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../shared/services/toast';
import { Property } from '../../../core/models/property.model';

@Component({
  selector: 'app-edit-property',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './edit-property.html',
  styleUrl: './edit-property.css',
})
export class EditProperty implements OnInit {

  form!: FormGroup;

  loading = true;
  saving = false;

  propertyId = '';

  existingImages: string[] = [];

  newFiles: File[] = [];
  newPreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => this.loadProperty());
  }

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id') || '';
    this.form = this.buildForm();
  }

  buildForm(): FormGroup {
    return this.fb.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]],

      description: ['', Validators.maxLength(2000)],

      transactionType: ['RENT', Validators.required],

      priceAmount: [null, [
        Validators.required,
        Validators.min(1)
      ]],

      typeProperty: ['APARTMENT', Validators.required],

      numberOfBedrooms: [null, Validators.min(0)],
      numberOfBathrooms: [null, Validators.min(0)],
      areaInSquareMeters: [null, Validators.min(1)],

      petsAllowed: [false],
      furnished: [false],

      paymentFrequency: ['MONTHLY'],

      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required],

      latitude: [null],
      longitude: [null],
    });
  }

  loadProperty(): void {

    if (!this.propertyId) return;

    this.propertyService.getById(this.propertyId).subscribe({

      next: (p: Property) => {

        this.existingImages = p.imageUrls || [];

        this.form.patchValue({

          title: p.title,
          description: p.description,

          transactionType: p.transactionType,
          priceAmount: p.priceAmount,

          typeProperty: p.typeProperty,

          numberOfBedrooms: p.numberOfBedrooms ?? null,
          numberOfBathrooms: p.numberOfBathrooms ?? null,
          areaInSquareMeters: p.areaInSquareMeters ?? null,

          petsAllowed: p.petsAllowed ?? false,
          furnished: p.furnished ?? false,

          paymentFrequency: p.paymentFrequency ?? 'MONTHLY',

          street: p.address.street,
          city: p.address.city,
          state: p.address.state,
          country: p.address.country,
          postalCode: p.address.postalCode,

          latitude: p.coordinates?.latitude ?? null,
          longitude: p.coordinates?.longitude ?? null,
        });

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: () => {

        this.loading = false;

        this.toast.error('No se pudo cargar la propiedad.');

        this.router.navigate(['/my-properties']);
      }
    });
  }

  onFilesChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    Array.from(input.files).forEach(file => {

      this.newFiles.push(file);

      const reader = new FileReader();

      reader.onload = e => {

        this.newPreviews.push(
          e.target!.result as string
        );

        this.cdr.detectChanges();
      };

      reader.readAsDataURL(file);
    });
  }

  removeNewFile(index: number): void {

    this.newFiles.splice(index, 1);

    this.newPreviews.splice(index, 1);
  }

  onSubmit(): void {

    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const v = this.form.value;

    const data: any = {

      title: v.title,

      description: v.description || undefined,

      transactionType: v.transactionType,

      priceAmount: v.priceAmount,

      typeProperty: v.typeProperty,

      numberOfBedrooms: v.numberOfBedrooms || undefined,

      numberOfBathrooms: v.numberOfBathrooms || undefined,

      areaInSquareMeters: v.areaInSquareMeters || undefined,

      petsAllowed: v.petsAllowed,

      furnished: v.furnished,

      paymentFrequency:
        v.transactionType === 'RENT'
          ? v.paymentFrequency
          : undefined,

      address: {
        street: v.street,
        city: v.city,
        state: v.state,
        country: v.country,
        postalCode: v.postalCode
      }
    };

    if (v.latitude && v.longitude) {

      data.coordinates = {
        latitud: v.latitude,
        longitud: v.longitude
      };
    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    this.newFiles.forEach(file => formData.append('files', file));

    this.newFiles.forEach(file => {
      formData.append('files', file);
    });

    this.saving = true;

    this.propertyService.update(
      this.propertyId,
      formData
    ).subscribe({

      next: () => {

        this.toast.success(
          'Propiedad actualizada correctamente.'
        );

        this.router.navigate(['/my-properties']);
      },

      error: () => {

        this.saving = false;

        this.toast.error(
          'Error al actualizar la propiedad.'
        );
      }
    });
  }
  sanitizeDecimal(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const fixed = input.value.replace(',', '.');
    this.form.get(field)?.setValue(fixed, { emitEvent: false });
  }

}