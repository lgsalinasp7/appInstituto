export const reportsPaths = {
  '/api/reports/dashboard': {
    get: {
      tags: ['Reportes'],
      summary: 'Estadisticas del dashboard',
      description: 'Obtiene las estadisticas principales del dashboard: ingresos del dia y mes, estudiantes activos, compromisos vencidos y grafico de ingresos.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor' },
        { name: 'programId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por programa' },
      ],
      responses: {
        200: {
          description: 'Estadisticas del dashboard',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      todayRevenue: { type: 'number', example: 1800000 },
                      monthlyRevenue: { type: 'number', example: 15000000 },
                      revenueChange: { type: 'number', example: 12.5, description: 'Cambio porcentual vs mes anterior' },
                      activeStudents: { type: 'integer', example: 120 },
                      studentsChange: { type: 'number', example: 5.2 },
                      pendingPaymentsCount: { type: 'integer', example: 25 },
                      overdueAmount: { type: 'number', example: 5000000 },
                      pendingChange: { type: 'number', example: -3.1 },
                      conversionRate: { type: 'number', example: 35.5 },
                      revenueChart: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string', example: 'Semana 1' },
                            total: { type: 'number', example: 3500000 },
                          },
                        },
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
  '/api/reports/revenue-chart': {
    get: {
      tags: ['Reportes'],
      summary: 'Grafico de ingresos',
      description: 'Obtiene datos para el grafico de ingresos agrupados por dia (semana) o por semana (mes).',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'period', in: 'query', schema: { type: 'string', enum: ['week', 'month'], default: 'month' }, description: 'Periodo: week (ultimos 7 dias) o month (ultimas 4 semanas)' },
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor' },
      ],
      responses: {
        200: {
          description: 'Datos del grafico',
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
                        name: { type: 'string', example: 'Lun 15' },
                        total: { type: 'number', example: 1800000 },
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
  '/api/reports/programs': {
    get: {
      tags: ['Reportes'],
      summary: 'Reporte por programas',
      description: 'Obtiene reporte de cada programa: estudiantes, ingresos, pendientes y progreso promedio de pagos.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Reporte de programas',
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
                        programId: { type: 'string' },
                        programName: { type: 'string', example: 'Tecnico en Desarrollo de Software' },
                        totalStudents: { type: 'integer', example: 45 },
                        activeStudents: { type: 'integer', example: 38 },
                        totalRevenue: { type: 'number', example: 25000000 },
                        pendingAmount: { type: 'number', example: 8000000 },
                        averagePaymentProgress: { type: 'number', example: 0.65, description: 'Progreso promedio (0-1)' },
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
  '/api/reports/advisors': {
    get: {
      tags: ['Reportes'],
      summary: 'Reporte por asesores',
      description: 'Obtiene reporte de rendimiento de cada asesor: estudiantes, ventas, recaudo y tasa de cobro.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Reporte de asesores',
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
                        advisorId: { type: 'string' },
                        advisorName: { type: 'string', example: 'Juan Carlos Rodriguez' },
                        advisorEmail: { type: 'string', example: 'juan.rodriguez@instituto.com' },
                        totalStudents: { type: 'integer', example: 30 },
                        activeStudents: { type: 'integer', example: 25 },
                        totalSales: { type: 'number', example: 100000000 },
                        totalCollected: { type: 'number', example: 45000000 },
                        pendingAmount: { type: 'number', example: 55000000 },
                        collectionRate: { type: 'number', example: 45, description: 'Tasa de cobro (%)' },
                        studentsThisMonth: { type: 'integer', example: 5 },
                        revenueThisMonth: { type: 'number', example: 8000000 },
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
  '/api/reports/financial': {
    get: {
      tags: ['Reportes'],
      summary: 'Reporte financiero',
      description: 'Obtiene reporte financiero detallado: total recaudado, por metodo de pago, pendientes y desglose diario.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'advisorId', in: 'query', schema: { type: 'string' } },
        { name: 'programId', in: 'query', schema: { type: 'string' } },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
      ],
      responses: {
        200: {
          description: 'Reporte financiero',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      totalRevenue: { type: 'number', example: 45000000 },
                      totalPayments: { type: 'integer', example: 150 },
                      averagePayment: { type: 'number', example: 300000 },
                      pendingAmount: { type: 'number', example: 25000000 },
                      byMethod: { type: 'array', items: { type: 'object', properties: { method: { type: 'string' }, count: { type: 'integer' }, total: { type: 'number' } } } },
                      dailyRevenue: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, total: { type: 'number' } } } },
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
  '/api/reports/portfolio-aging': {
    get: {
      tags: ['Reportes'],
      summary: 'Analisis de antiguedad de cartera',
      description: 'Clasifica la cartera vencida en rangos de antiguedad: 0-30, 31-60, 61-90 y 90+ dias.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Reporte de antiguedad de cartera',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      brackets: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            label: { type: 'string', example: '0-30 dias' },
                            amount: { type: 'number', example: 3500000 },
                            count: { type: 'integer', example: 8 },
                          },
                        },
                      },
                      totalOverdue: { type: 'number', example: 12000000 },
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
  '/api/reports/payments/export': {
    get: {
      tags: ['Reportes'],
      summary: 'Exportar pagos a Excel',
      description: 'Genera y descarga un archivo Excel (.xlsx) con el listado de pagos filtrado.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha inicio' },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha fin' },
        { name: 'method', in: 'query', schema: { $ref: '#/components/schemas/PaymentMethod' }, description: 'Filtrar por metodo' },
      ],
      responses: {
        200: {
          description: 'Archivo Excel con los pagos',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
};
