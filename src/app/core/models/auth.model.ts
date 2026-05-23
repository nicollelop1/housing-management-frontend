export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  userId: number;
  email: string;
  primerNombre?: string;
  primerApellido?: string;
  roles?: string[];
}

export interface RegisterRequest {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  cedula?: string;
  edad: number;
  phoneNumber?: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  userId: number;
  email: string;
}

export interface ForgotPasswordRequest { email: string; }
export interface VerifyCodeRequest { email: string; code: string; }
export interface ResetPasswordRequest { email: string; code: string; newPassword: string; }

export interface ProfileResponse {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  cedula?: string;
  edad: number;
  phoneNumber?: string;
  profilePictureUrl?: string;
  active: boolean;
  roles: string[];
}

export interface User {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email: string;
  profilePictureUrl?: string;
}

export interface UpdateProfileRequest {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  cedula?: string;
  edad: number;
  phoneNumber?: string;
}