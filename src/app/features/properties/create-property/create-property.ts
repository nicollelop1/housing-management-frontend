import { Component, afterNextRender, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../shared/services/toast';


@Component({
  selector: 'app-create-property',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-property.html',
  styleUrl: './create-property.css',

})
export class CreateProperty {

  form: FormGroup;
  loading = false;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private propertyService: PropertyService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.form = this.buildForm();
  }

  buildForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', Validators.maxLength(2000)],
      transactionType: ['RENT', Validators.required],
      priceAmount: [null, [Validators.required, Validators.min(1)]],
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

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const newFiles = Array.from(input.files);
    this.selectedFiles.push(...newFiles);
    newFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        this.previewUrls.push(e.target!.result as string);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(f);
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (this.selectedFiles.length === 0) {
      this.toast.error('Debes subir al menos una imagen.');
      return;
    }

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
      paymentFrequency: v.transactionType === 'RENT' ? v.paymentFrequency : undefined,
      address: { street: v.street, city: v.city, state: v.state, country: v.country, postalCode: v.postalCode },
    };
    const latValue = String(v.latitude || '').trim();
    const lngValue = String(v.longitude || '').trim();

    if (latValue && lngValue) {
      data.coordinates = {
        latitud: Number(latValue),
        longitud: Number(lngValue)
      };

    }

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    this.selectedFiles.forEach(f => formData.append('files', f));

    console.log('Token:', localStorage.getItem('token'));
    console.log('FormData entries:');
    formData.forEach((value, key) => {
      console.log(key, ':', value);
    });

    this.loading = true;
    this.cdr.detectChanges();

    this.propertyService.create(formData).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.toast.success('¡Propiedad creada correctamente!');
          this.router.navigate(['/my-properties']);
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.loading = false;
          this.toast.error('Error al crear la propiedad. Inténtalo de nuevo.');
          this.cdr.detectChanges();
        });
      }
    });


  }
  sanitizeDecimal(field: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const fixed = input.value.replace(',', '.');
    this.form.get(field)?.setValue(fixed, { emitEvent: false });
  }
}