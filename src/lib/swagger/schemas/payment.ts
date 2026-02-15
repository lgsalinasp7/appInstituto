export const paymentSchemas = {
  Payment: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const, example: 'clx1234567890' },
      amount: { type: 'number' as const, example: 573333, description: 'Monto del pago en pesos' },
      paymentDate: { type: 'string' as const, format: 'date-time' as const, example: '2026-02-15T10:30:00.000Z' },
      method: { $ref: '#/components/schemas/PaymentMethod' },
      reference: { type: 'string' as const, nullable: true, example: 'REF-NEQUI-12345' },
      receiptNumber: { type: 'string' as const, example: 'REC-202602-00001' },
      comments: { type: 'string' as const, nullable: true, example: 'Pago modulo 2' },
      paymentType: { $ref: '#/components/schemas/PaymentType' },
      moduleNumber: { type: 'integer' as const, nullable: true, example: 2 },
      studentId: { type: 'string' as const },
      registeredById: { type: 'string' as const },
      createdAt: { type: 'string' as const, format: 'date-time' as const },
      student: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          fullName: { type: 'string' as const, example: 'Maria Fernanda Lopez Garcia' },
          documentNumber: { type: 'string' as const, example: '1098765432' },
          program: {
            type: 'object' as const,
            properties: {
              name: { type: 'string' as const, example: 'Tecnico en Desarrollo de Software' },
            },
          },
        },
      },
      registeredBy: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          name: { type: 'string' as const, example: 'Juan Carlos Rodriguez' },
        },
      },
    },
  },
  CreatePaymentInput: {
    type: 'object' as const,
    required: ['amount', 'paymentDate', 'method', 'studentId', 'registeredById'],
    properties: {
      amount: { type: 'number' as const, minimum: 0.01, example: 573333, description: 'Monto del pago en pesos (debe ser mayor a 0)' },
      paymentDate: { type: 'string' as const, format: 'date' as const, example: '2026-02-15' },
      method: { $ref: '#/components/schemas/PaymentMethod' },
      reference: { type: 'string' as const, example: 'REF-NEQUI-12345' },
      comments: { type: 'string' as const, example: 'Pago modulo 2' },
      studentId: { type: 'string' as const, example: 'clx_student_001' },
      registeredById: { type: 'string' as const, example: 'clx_user_001' },
    },
  },
  UpdatePaymentInput: {
    type: 'object' as const,
    properties: {
      amount: { type: 'number' as const, minimum: 0.01 },
      paymentDate: { type: 'string' as const, format: 'date' as const },
      method: { $ref: '#/components/schemas/PaymentMethod' },
      reference: { type: 'string' as const },
      comments: { type: 'string' as const },
    },
  },
  PaymentStats: {
    type: 'object' as const,
    properties: {
      totalCollected: { type: 'number' as const, example: 15000000 },
      paymentsCount: { type: 'integer' as const, example: 45 },
      averagePayment: { type: 'number' as const, example: 333333 },
      byMethod: {
        type: 'object' as const,
        additionalProperties: {
          type: 'object' as const,
          properties: {
            count: { type: 'integer' as const },
            total: { type: 'number' as const },
          },
        },
        example: {
          NEQUI: { count: 20, total: 8000000 },
          BANCOLOMBIA: { count: 15, total: 5000000 },
          EFECTIVO: { count: 10, total: 2000000 },
        },
      },
    },
  },
  PaymentCommitment: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const, example: 'clx1234567890' },
      scheduledDate: { type: 'string' as const, format: 'date-time' as const, example: '2026-03-15T00:00:00.000Z' },
      amount: { type: 'number' as const, example: 573333 },
      status: { $ref: '#/components/schemas/CommitmentStatus' },
      rescheduledDate: { type: 'string' as const, format: 'date-time' as const, nullable: true },
      comments: { type: 'string' as const, nullable: true },
      moduleNumber: { type: 'integer' as const, example: 2 },
      notificationsSent: { type: 'object' as const, nullable: true },
      studentId: { type: 'string' as const },
      createdAt: { type: 'string' as const, format: 'date-time' as const },
      updatedAt: { type: 'string' as const, format: 'date-time' as const },
      student: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          fullName: { type: 'string' as const, example: 'Maria Fernanda Lopez Garcia' },
          phone: { type: 'string' as const, example: '3001234567' },
          advisor: {
            type: 'object' as const,
            properties: {
              name: { type: 'string' as const, example: 'Juan Carlos Rodriguez' },
            },
          },
        },
      },
    },
  },
  Receipt: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const },
      receiptNumber: { type: 'string' as const, example: 'REC-202602-00001' },
      generatedAt: { type: 'string' as const, format: 'date-time' as const },
      sentVia: { type: 'string' as const, nullable: true, example: 'whatsapp' },
      sentAt: { type: 'string' as const, format: 'date-time' as const, nullable: true },
      pdfUrl: { type: 'string' as const, nullable: true },
      payment: { $ref: '#/components/schemas/Payment' },
    },
  },
};
