export interface LoginRequest{
    email: string;
    password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  primerNombre:    string;
  segundoNombre:   string;
  primerApellido:  string;
  segundoApellido: string;
  email:           string;
  cedula:          string;
  edad:            number;
  phoneNumber:     string;
  password:        string;
}