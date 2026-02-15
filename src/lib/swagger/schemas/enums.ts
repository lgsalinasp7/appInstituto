export const enumSchemas = {
  StudentStatus: {
    type: 'string' as const,
    enum: ['MATRICULADO', 'ACTIVO', 'INACTIVO', 'GRADUADO', 'EN_OTRA_INSTITUCION', 'PENDIENTE'],
    description: 'Estado del estudiante en el sistema',
  },
  PaymentFrequency: {
    type: 'string' as const,
    enum: ['MENSUAL', 'QUINCENAL'],
    description: 'Frecuencia de pago del estudiante',
  },
  PaymentType: {
    type: 'string' as const,
    enum: ['MATRICULA', 'MODULO'],
    description: 'Tipo de pago realizado',
  },
  PaymentMethod: {
    type: 'string' as const,
    enum: ['BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'EFECTIVO', 'OTRO'],
    description: 'Metodo de pago utilizado',
  },
  CommitmentStatus: {
    type: 'string' as const,
    enum: ['PAGADO', 'PENDIENTE', 'EN_COMPROMISO'],
    description: 'Estado del compromiso de pago',
  },
  ProspectStatus: {
    type: 'string' as const,
    enum: ['CONTACTADO', 'EN_SEGUIMIENTO', 'CERRADO', 'PERDIDO'],
    description: 'Estado del prospecto en el embudo de ventas',
  },
  TenantStatus: {
    type: 'string' as const,
    enum: ['ACTIVO', 'PENDIENTE', 'SUSPENDIDO', 'CANCELADO'],
    description: 'Estado del tenant en la plataforma',
  },
  InvitationStatus: {
    type: 'string' as const,
    enum: ['PENDING', 'ACCEPTED', 'EXPIRED'],
    description: 'Estado de la invitacion',
  },
  InteractionType: {
    type: 'string' as const,
    enum: ['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'OTHER'],
    description: 'Tipo de interaccion registrada con un prospecto',
  },
  PlatformRole: {
    type: 'string' as const,
    enum: ['SUPER_ADMIN', 'ASESOR_COMERCIAL', 'MARKETING'],
    description: 'Rol a nivel de plataforma (admin global)',
  },
};
