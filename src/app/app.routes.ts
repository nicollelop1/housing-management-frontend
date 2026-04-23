import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { VerifyCode } from './features/auth/verify-code/verify-code';
import { ResetPassword } from './features/auth/reset-password/reset-password';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'verify-code', component: VerifyCode },
  { path: 'reset-password', component: ResetPassword}
];
