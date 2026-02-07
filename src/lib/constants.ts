/**
 * Constants and Type Definitions
 * Usando el patrón const para tipos TypeScript seguros
 */

// Estados del Tenant
export const TENANT_STATUS = {
  ACTIVO: "ACTIVO",
  PENDIENTE: "PENDIENTE",
  SUSPENDIDO: "SUSPENDIDO",
  CANCELADO: "CANCELADO",
} as const;

export type TenantStatus = (typeof TENANT_STATUS)[keyof typeof TENANT_STATUS];

// Planes del Tenant
export const TENANT_PLAN = {
  BASICO: "BASICO",
  PROFESIONAL: "PROFESIONAL",
  EMPRESARIAL: "EMPRESARIAL",
} as const;

export type TenantPlan = (typeof TENANT_PLAN)[keyof typeof TENANT_PLAN];

// Roles de Plataforma
export const PLATFORM_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ASESOR_COMERCIAL: "ASESOR_COMERCIAL",
  MARKETING: "MARKETING",
} as const;

export type PlatformRole = (typeof PLATFORM_ROLE)[keyof typeof PLATFORM_ROLE];

// Estados de Estudiante
export const STUDENT_STATUS = {
  MATRICULADO: "MATRICULADO",
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO",
  GRADUADO: "GRADUADO",
  EN_OTRA_INSTITUCION: "EN_OTRA_INSTITUCION",
  PENDIENTE: "PENDIENTE",
} as const;

export type StudentStatus = (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];

// Frecuencia de Pago
export const PAYMENT_FREQUENCY = {
  MENSUAL: "MENSUAL",
  QUINCENAL: "QUINCENAL",
} as const;

export type PaymentFrequency = (typeof PAYMENT_FREQUENCY)[keyof typeof PAYMENT_FREQUENCY];

// Tipos de Pago
export const PAYMENT_TYPE = {
  MATRICULA: "MATRICULA",
  MODULO: "MODULO",
} as const;

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

// Métodos de Pago
export const PAYMENT_METHOD = {
  BANCOLOMBIA: "BANCOLOMBIA",
  NEQUI: "NEQUI",
  DAVIPLATA: "DAVIPLATA",
  EFECTIVO: "EFECTIVO",
  OTRO: "OTRO",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

// Estados de Compromiso de Pago
export const COMMITMENT_STATUS = {
  PAGADO: "PAGADO",
  PENDIENTE: "PENDIENTE",
  EN_COMPROMISO: "EN_COMPROMISO",
} as const;

export type CommitmentStatus = (typeof COMMITMENT_STATUS)[keyof typeof COMMITMENT_STATUS];

// Estados de Prospecto
export const PROSPECT_STATUS = {
  CONTACTADO: "CONTACTADO",
  EN_SEGUIMIENTO: "EN_SEGUIMIENTO",
  CERRADO: "CERRADO",
  PERDIDO: "PERDIDO",
} as const;

export type ProspectStatus = (typeof PROSPECT_STATUS)[keyof typeof PROSPECT_STATUS];

// Estados de Invitación
export const INVITATION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  EXPIRED: "EXPIRED",
} as const;

export type InvitationStatus = (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];

// Contextos de la Aplicación
export const APP_CONTEXT = {
  LANDING: "landing",
  ADMIN: "admin",
  TENANT: "tenant",
} as const;

export type AppContext = (typeof APP_CONTEXT)[keyof typeof APP_CONTEXT];

// Temas
export const THEME = {
  LIGHT: "light",
  DARK: "dark",
} as const;

export type Theme = (typeof THEME)[keyof typeof THEME];

// Tipos de Documento
export const DOCUMENT_TYPE = {
  CC: "CC",
  TI: "TI",
  CE: "CE",
  PASAPORTE: "PASAPORTE",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

// Permisos comunes
export const PERMISSIONS = {
  // Usuarios
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",

  // Estudiantes
  STUDENTS_READ: "students:read",
  STUDENTS_CREATE: "students:create",
  STUDENTS_UPDATE: "students:update",
  STUDENTS_DELETE: "students:delete",

  // Pagos
  PAYMENTS_READ: "payments:read",
  PAYMENTS_CREATE: "payments:create",
  PAYMENTS_UPDATE: "payments:update",
  PAYMENTS_DELETE: "payments:delete",

  // Programas
  PROGRAMS_READ: "programs:read",
  PROGRAMS_CREATE: "programs:create",
  PROGRAMS_UPDATE: "programs:update",
  PROGRAMS_DELETE: "programs:delete",

  // Reportes
  REPORTS_READ: "reports:read",
  REPORTS_EXPORT: "reports:export",

  // Configuración
  SETTINGS_READ: "settings:read",
  SETTINGS_UPDATE: "settings:update",

  // Admin total
  ADMIN_FULL: "admin:full",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

// Límites de archivos
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "No autorizado. Debe iniciar sesión.",
  FORBIDDEN: "No tiene permisos para realizar esta acción.",
  NOT_FOUND: "Recurso no encontrado.",
  VALIDATION_ERROR: "Error de validación. Revise los datos enviados.",
  INTERNAL_ERROR: "Error interno del servidor. Intente nuevamente más tarde.",
  TENANT_NOT_FOUND: "Tenant no encontrado.",
  TENANT_SUSPENDED: "La cuenta está suspendida. Contacte a soporte.",
  TENANT_CANCELED: "La cuenta ha sido cancelada.",
  INVALID_CREDENTIALS: "Credenciales inválidas.",
  SESSION_EXPIRED: "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
  RATE_LIMIT_EXCEEDED: "Demasiados intentos. Por favor, intente más tarde.",
} as const;

// Helpers para validación
export function isValidTenantStatus(status: string): status is TenantStatus {
  return Object.values(TENANT_STATUS).includes(status as TenantStatus);
}

export function isValidPaymentMethod(method: string): method is PaymentMethod {
  return Object.values(PAYMENT_METHOD).includes(method as PaymentMethod);
}

export function isValidStudentStatus(status: string): status is StudentStatus {
  return Object.values(STUDENT_STATUS).includes(status as StudentStatus);
}

export function isValidAppContext(context: string): context is AppContext {
  return Object.values(APP_CONTEXT).includes(context as AppContext);
}
