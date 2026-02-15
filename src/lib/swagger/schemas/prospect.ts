export const prospectSchemas = {
  Prospect: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const, example: 'clx1234567890' },
      name: { type: 'string' as const, example: 'Ana Sofia Ramirez Mejia' },
      phone: { type: 'string' as const, example: '3157654321' },
      email: { type: 'string' as const, nullable: true, example: 'ana.ramirez@email.com' },
      status: { $ref: '#/components/schemas/ProspectStatus' },
      observations: { type: 'string' as const, nullable: true, example: 'Interesada en programa de enfermeria, llamar el lunes' },
      programId: { type: 'string' as const, nullable: true },
      advisorId: { type: 'string' as const },
      createdAt: { type: 'string' as const, format: 'date-time' as const },
      updatedAt: { type: 'string' as const, format: 'date-time' as const },
      program: {
        type: 'object' as const,
        nullable: true,
        properties: {
          id: { type: 'string' as const },
          name: { type: 'string' as const, example: 'Auxiliar en Enfermeria' },
        },
      },
      advisor: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          name: { type: 'string' as const, example: 'Juan Carlos Rodriguez' },
        },
      },
    },
  },
  CreateProspectInput: {
    type: 'object' as const,
    required: ['name', 'phone', 'advisorId'],
    properties: {
      name: { type: 'string' as const, minLength: 3, example: 'Ana Sofia Ramirez Mejia' },
      phone: { type: 'string' as const, minLength: 7, example: '3157654321' },
      email: { type: 'string' as const, format: 'email' as const, example: 'ana.ramirez@email.com' },
      status: { $ref: '#/components/schemas/ProspectStatus' },
      observations: { type: 'string' as const, example: 'Interesada en programa de enfermeria' },
      programId: { type: 'string' as const, example: 'clx_program_002' },
      advisorId: { type: 'string' as const, example: 'clx_user_001' },
    },
  },
  UpdateProspectInput: {
    type: 'object' as const,
    properties: {
      name: { type: 'string' as const, minLength: 3 },
      phone: { type: 'string' as const, minLength: 7 },
      email: { type: 'string' as const, format: 'email' as const },
      status: { $ref: '#/components/schemas/ProspectStatus' },
      observations: { type: 'string' as const },
      programId: { type: 'string' as const, nullable: true },
    },
  },
  ConvertProspectInput: {
    type: 'object' as const,
    required: ['documentType', 'documentNumber', 'enrollmentDate', 'initialPayment', 'totalProgramValue'],
    properties: {
      documentType: { type: 'string' as const, example: 'CC' },
      documentNumber: { type: 'string' as const, minLength: 5, example: '1098765432' },
      address: { type: 'string' as const, example: 'Calle 45 # 12-34' },
      guardianName: { type: 'string' as const },
      guardianPhone: { type: 'string' as const },
      guardianEmail: { type: 'string' as const, format: 'email' as const },
      enrollmentDate: { type: 'string' as const, format: 'date' as const, example: '2026-02-15' },
      initialPayment: { type: 'number' as const, minimum: 0, example: 60000 },
      totalProgramValue: { type: 'number' as const, minimum: 1, example: 3500000 },
    },
  },
  ProspectInteraction: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const },
      type: { $ref: '#/components/schemas/InteractionType' },
      content: { type: 'string' as const, example: 'Se contacto por WhatsApp, mostrando interes en el programa' },
      advisorId: { type: 'string' as const },
      date: { type: 'string' as const, format: 'date-time' as const },
      createdAt: { type: 'string' as const, format: 'date-time' as const },
    },
  },
  CreateInteractionInput: {
    type: 'object' as const,
    required: ['type', 'content', 'advisorId'],
    properties: {
      type: { $ref: '#/components/schemas/InteractionType' },
      content: { type: 'string' as const, example: 'Se contacto por WhatsApp, mostrando interes en el programa' },
      advisorId: { type: 'string' as const, example: 'clx_user_001' },
      date: { type: 'string' as const, format: 'date-time' as const },
    },
  },
  ProspectStats: {
    type: 'object' as const,
    properties: {
      total: { type: 'integer' as const, example: 50 },
      byStatus: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            status: { $ref: '#/components/schemas/ProspectStatus' },
            _count: { type: 'integer' as const },
          },
        },
      },
      conversionRate: { type: 'number' as const, example: 35.5, description: 'Porcentaje de conversion (CERRADO/total * 100)' },
      thisMonth: { type: 'integer' as const, example: 12, description: 'Prospectos creados este mes' },
    },
  },
};
