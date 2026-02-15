export const contentSchemas = {
  AcademicContent: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const, example: 'clx1234567890' },
      name: { type: 'string' as const, example: 'Modulo 1 - Fundamentos de Programacion' },
      description: { type: 'string' as const, nullable: true, example: 'Introduccion a logica de programacion y algoritmos' },
      orderIndex: { type: 'integer' as const, example: 1 },
      programId: { type: 'string' as const },
      createdAt: { type: 'string' as const, format: 'date-time' as const },
      updatedAt: { type: 'string' as const, format: 'date-time' as const },
    },
  },
  CreateContentInput: {
    type: 'object' as const,
    required: ['name', 'orderIndex', 'programId'],
    properties: {
      name: { type: 'string' as const, example: 'Modulo 3 - Bases de Datos' },
      description: { type: 'string' as const, example: 'Fundamentos de bases de datos relacionales' },
      orderIndex: { type: 'integer' as const, example: 3 },
      programId: { type: 'string' as const, example: 'clx_program_001' },
    },
  },
  UpdateContentInput: {
    type: 'object' as const,
    properties: {
      name: { type: 'string' as const },
      description: { type: 'string' as const },
      orderIndex: { type: 'integer' as const },
    },
  },
  ContentDelivery: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const },
      deliveredAt: { type: 'string' as const, format: 'date-time' as const },
      method: { type: 'string' as const, example: 'whatsapp', description: 'Metodo de entrega: email, whatsapp, manual, presencial' },
      studentId: { type: 'string' as const },
      contentId: { type: 'string' as const },
      content: { $ref: '#/components/schemas/AcademicContent' },
    },
  },
  DeliverContentInput: {
    type: 'object' as const,
    required: ['studentId', 'contentId', 'method'],
    properties: {
      studentId: { type: 'string' as const, example: 'clx_student_001' },
      contentId: { type: 'string' as const, example: 'clx_content_001' },
      method: { type: 'string' as const, enum: ['email', 'whatsapp', 'manual', 'presencial'], example: 'whatsapp' },
    },
  },
  StudentContentStatus: {
    type: 'object' as const,
    properties: {
      studentId: { type: 'string' as const },
      studentName: { type: 'string' as const, example: 'Maria Fernanda Lopez Garcia' },
      programId: { type: 'string' as const },
      programName: { type: 'string' as const, example: 'Tecnico en Desarrollo de Software' },
      totalPayments: { type: 'number' as const },
      paymentsCount: { type: 'integer' as const, example: 3 },
      availableContents: { type: 'array' as const, items: { $ref: '#/components/schemas/AcademicContent' } },
      deliveredContents: { type: 'array' as const, items: { $ref: '#/components/schemas/AcademicContent' } },
      pendingContents: { type: 'array' as const, items: { $ref: '#/components/schemas/AcademicContent' } },
    },
  },
};
