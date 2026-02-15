export const carteraPaths = {
  '/api/cartera': {
    get: {
      tags: ['Cartera'],
      summary: 'Listar cartera',
      description: 'Obtiene la lista paginada de compromisos de pago (cartera) con informacion del estudiante y asesor.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor' },
        { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/CommitmentStatus' }, description: 'Filtrar por estado' },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha inicio' },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha fin' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
      ],
      responses: {
        200: {
          description: 'Lista de cartera',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      commitments: { type: 'array', items: { $ref: '#/components/schemas/PaymentCommitment' } },
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/cartera/stats': {
    get: {
      tags: ['Cartera'],
      summary: 'Estadisticas de cartera',
      description: 'Obtiene estadisticas agregadas de cartera: pendientes, vencidos, del dia y proximos.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Estadisticas de cartera',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      totalPending: { type: 'number', example: 25000000 },
                      totalOverdue: { type: 'number', example: 5000000 },
                      todayAmount: { type: 'number', example: 1200000 },
                      upcomingAmount: { type: 'number', example: 3500000 },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/cartera/debts': {
    get: {
      tags: ['Cartera'],
      summary: 'Listar deudas pendientes',
      description: 'Obtiene la lista de estudiantes con deudas pendientes, incluyendo saldo y dias de mora.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre o documento' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
      ],
      responses: {
        200: {
          description: 'Lista de deudas',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      students: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            studentId: { type: 'string' },
                            studentName: { type: 'string', example: 'Maria Fernanda Lopez Garcia' },
                            documentNumber: { type: 'string', example: '1098765432' },
                            phone: { type: 'string', example: '3001234567' },
                            programName: { type: 'string', example: 'Tecnico en Desarrollo de Software' },
                            advisorName: { type: 'string', example: 'Juan Carlos Rodriguez' },
                            totalProgramValue: { type: 'number' },
                            totalPaid: { type: 'number' },
                            remainingBalance: { type: 'number', example: 2960000 },
                            lastPaymentDate: { type: 'string', format: 'date-time', nullable: true },
                            daysSinceLastPayment: { type: 'integer', example: 45 },
                          },
                        },
                      },
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      totalPages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/cartera/summary': {
    get: {
      tags: ['Cartera'],
      summary: 'Resumen de cartera',
      description: 'Obtiene un resumen consolidado de cartera: total pendiente, vencido, del dia y proximos 7 dias.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor' },
      ],
      responses: {
        200: {
          description: 'Resumen de cartera',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      totalPendingAmount: { type: 'number', example: 25000000 },
                      overdueCount: { type: 'integer', example: 8 },
                      overdueAmount: { type: 'number', example: 5000000 },
                      todayCount: { type: 'integer', example: 3 },
                      todayAmount: { type: 'number', example: 1200000 },
                      upcomingCount: { type: 'integer', example: 12 },
                      upcomingAmount: { type: 'number', example: 3500000 },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/cartera/alerts': {
    get: {
      tags: ['Cartera'],
      summary: 'Alertas de cartera',
      description: 'Obtiene alertas clasificadas: vencidos, del dia y proximos a vencer (7 dias).',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor' },
      ],
      responses: {
        200: {
          description: 'Alertas de cartera',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        type: { type: 'string', enum: ['overdue', 'today', 'upcoming'], description: 'Tipo de alerta' },
                        studentName: { type: 'string', example: 'Maria Fernanda Lopez Garcia' },
                        studentPhone: { type: 'string', example: '3001234567' },
                        amount: { type: 'number', example: 573333 },
                        dueDate: { type: 'string', format: 'date-time' },
                        daysOverdue: { type: 'integer', example: 5, description: 'Dias de atraso (solo para overdue)' },
                        advisorName: { type: 'string', example: 'Juan Carlos Rodriguez' },
                        studentId: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
};
