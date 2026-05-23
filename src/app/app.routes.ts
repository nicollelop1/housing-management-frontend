import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { VerifyCode } from './features/auth/verify-code/verify-code';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { Properties } from './features/properties/properties';
import { MyProperties } from './features/properties/my-properties/my-properties';
import { CreateProperty } from './features/properties/create-property/create-property';
import { EditProperty } from './features/properties/edit-property/edit-property';
import { MyContractsComponent } from './features/contracts/my-contracts/my-contracts';
import { ContractDetail } from './features/contracts/contract-detail/contract-detail';
import { OwnerRequests } from './features/rental-requests/owner-requests/owner-requests';
import { TenantRequests } from './features/rental-requests/tenant-requests/tenant-requests';
import { Payments } from './features/payments/payments/payments';
import { PaymentHistory } from './features/payments/payment-history/payment-history';
import { Notifications } from './features/notifications/notifications/notifications';
import { PropertyDetail } from './features/properties/property-detail/property-detail';
import { EditProfile } from './features/profile/edit-profile/edit-profile';
import { ViewProfile } from './features/profile/view-profile/view-profile';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'verify-code', component: VerifyCode },
  { path: 'reset-password', component: ResetPassword },

  // Properties
  { path: 'properties-detail/:id', component: PropertyDetail, canActivate: [authGuard] },
  { path: 'my-properties', component: MyProperties, canActivate: [authGuard] },
  { path: 'create-property', component: CreateProperty, canActivate: [authGuard] },
  { path: 'edit-property/:id', component: EditProperty, canActivate: [authGuard] },

  // Contracts
  { path: 'contracts', component: MyContractsComponent, canActivate: [authGuard] },
  { path: 'contracts/:id', component: ContractDetail, canActivate: [authGuard] },

  // Rental Requests
  { path: 'rental-requests/owner', component: OwnerRequests, canActivate: [authGuard] },
  { path: 'rental-requests/tenant', component: TenantRequests, canActivate: [authGuard] },

  // Payments
  { path: 'payments', component: Payments, canActivate: [authGuard] },
  { path: 'payments/:contractId/history', component: PaymentHistory, canActivate: [authGuard] },

  // Notifications
  { path: 'notifications', component: Notifications, canActivate: [authGuard] },

  // Profile
  { path: 'profile/view', component: ViewProfile, canActivate: [authGuard] },
  { path: 'profile/edit', component: EditProfile, canActivate: [authGuard] },

];