export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Coordinates {
  latitud: number;
  longitud: number;
}

export type TransactionType = 'RENT' | 'SALE';
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO' | 'OFFICE' | 'LAND';
export type PropertyStatus = 'CREATED' | 'PUBLISHED' | 'RENTED' | 'SOLD' | 'DISABLED' | 'DELETED';
export type PaymentFrequency = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

export interface Owner {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  transactionType: TransactionType;
  priceAmount: number;
  typeProperty: PropertyType;
  status: PropertyStatus;

  owner: Owner;

  imageUrls: string[];
  address: Address;
  coordinates: Coordinates;

  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  areaInSquareMeters?: number;
  petsAllowed?: boolean;
  furnished?: boolean;
  paymentFrequency: PaymentFrequency;

  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  typeProperty?: PropertyType;
  bedrooms?: number;
  petsAllowed?: boolean;
  furnished?: boolean;
}

export interface CreatePropertyRequest {
  title: string;
  description?: string;
  transactionType: TransactionType;
  priceAmount: number;
  typeProperty: PropertyType;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  areaInSquareMeters?: number;
  petsAllowed?: boolean;
  furnished?: boolean;
  paymentFrequency?: PaymentFrequency;
  address: Address;
  coordinates?: Coordinates;
}