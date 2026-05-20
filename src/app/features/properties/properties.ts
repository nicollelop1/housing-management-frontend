import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property, PaymentFrequency, PropertyType, PropertyStatus } from '../../core/models/property.model';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './properties.html',
  styleUrl: './properties.css',
})
export class Properties {

}