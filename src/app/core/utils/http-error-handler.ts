import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(err: HttpErrorResponse): string {

  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }

  const backendMsg = err.error?.message || err.error?.error;
  if (backendMsg && typeof backendMsg === 'string' && backendMsg.length < 200) {
    return backendMsg;
  }

  switch (err.status) {
    case 400: return 'Los datos enviados no son válidos. Revisa el formulario.';
    case 401: return 'Sesión expirada o credenciales incorrectas. Inicia sesión de nuevo.';
    case 403: return 'No tienes permiso para realizar esta acción.';
    case 404: return 'El recurso solicitado no existe.';
    case 409: return 'Ya existe un registro con esos datos (correo o cédula).';
    case 422: return 'Los datos no cumplen el formato requerido por el servidor.';
    case 429: return 'Demasiados intentos seguidos. Espera un momento e intenta de nuevo.';
    case 500: return 'Error interno del servidor. Por favor repórtalo al equipo backend.';
    case 503: return 'El servidor no está disponible en este momento. Intenta más tarde.';
    default:  return `Error inesperado (${err.status}). Intenta de nuevo.`;
  }
}

export const AuthErrors = {
  LOGIN_401:    'Correo o contraseña incorrectos.',
  LOGIN_500:    'Error del servidor al iniciar sesión. Intenta más tarde.',
  REGISTER_409: 'El correo o cédula ya están registrados.',
  REGISTER_400: 'Revisa que todos los campos del formulario sean válidos.',
  FORGOT_404:   'No existe una cuenta con ese correo electrónico.',
  VERIFY_400:   'El código ingresado es incorrecto o ya expiró.',
  RESET_400:    'La contraseña no cumple los requisitos mínimos.',
};

export const PropertyErrors = {
  CREATE_400:  'Faltan campos obligatorios o los datos de la propiedad son inválidos.',
  CREATE_403:  'No tienes permiso para crear propiedades.',
  EDIT_403:    'Solo el propietario puede editar esta propiedad.',
  EDIT_404:    'La propiedad que intentas editar no existe.',
  PUBLISH_403: 'Solo el propietario puede publicar esta propiedad.',
  DELETE_403:  'Solo el propietario puede eliminar esta propiedad.',
  IMAGE_400:   'El archivo de imagen no es válido. Usa JPG o PNG.',
};

export const RentalErrors = {
  REQUEST_409: 'Ya tienes una solicitud activa para esta propiedad.',
  REQUEST_403: 'No puedes enviar una solicitud a tu propia propiedad.',
  ACCEPT_403:  'Solo el propietario puede aceptar solicitudes.',
  REJECT_403:  'Solo el propietario puede rechazar solicitudes.',
  CANCEL_400:  'Solo puedes cancelar solicitudes en estado PENDIENTE.',
};

export const ContractErrors = {
  VIEW_403:   'Solo el propietario o arrendatario pueden ver este contrato.',
  CANCEL_403: 'No tienes permiso para cancelar este contrato.',
  PDF_403:    'Solo las partes del contrato pueden descargar el PDF.',
};

export const PaymentErrors = {
  INITIATE_403: 'Solo el arrendatario puede iniciar el pago.',
  RECEIPT_400:  'El comprobante no está disponible porque el pago no se ha completado.',
  RECEIPT_403:  'Solo el propietario o arrendatario pueden ver el comprobante.',
};