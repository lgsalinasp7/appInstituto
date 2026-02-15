export const paymentsPaths = {
  '/api/payments': {
    get: {
      tags: ['Pagos'],
      summary: 'Listar pagos',
      description: 'Obtiene la lista paginada de pagos del tenant con filtros opcionales.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'studentId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por estudiante' },
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor que registro' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre de estudiante o numero de recibo' },
        { name: 'method', in: 'query', schema: { $ref: '#/components/schemas/PaymentMethod' }, description: 'Filtrar por metodo de pago' },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha inicio (YYYY-MM-DD)' },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha fin (YYYY-MM-DD)' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
      ],
      responses: {
        200: {
          description: 'Lista de pagos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      payments: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
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
    post: {
      tags: ['Pagos'],
      summary: 'Registrar pago',
      description: 'Registra un nuevo pago para un estudiante. Automaticamente genera numero de recibo, actualiza compromisos de pago y avanza el modulo actual del estudiante segun corresponda.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePaymentInput' },
            example: {
              amount: 573333,
              paymentDate: '2026-02-15',
              method: 'NEQUI',
              reference: 'REF-NEQUI-12345',
              comments: 'Pago modulo 2',
              studentId: 'clx_student_001',
              registeredById: 'clx_user_001',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Pago registrado con recibo generado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Payment' },
                  message: { type: 'string', example: 'Pago registrado exitosamente' },
                },
              },
            },
          },
        },
        400: { description: 'Datos invalidos o estudiante no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/payments/{id}': {
    put: {
      tags: ['Pagos'],
      summary: 'Actualizar pago',
      description: 'Actualiza los datos de un pago existente (monto, fecha, metodo, referencia, comentarios).',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del pago' }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePaymentInput' } } } },
      responses: {
        200: { description: 'Pago actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Payment' } } } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
        404: { description: 'Pago no encontrado' },
      },
    },
  },
  '/api/payments/stats': {
    get: {
      tags: ['Pagos'],
      summary: 'Estadisticas de pagos',
      description: 'Obtiene estadisticas de pagos: total recaudado, cantidad, promedio y desglose por metodo de pago.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor' },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha inicio' },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha fin' },
      ],
      responses: {
        200: { description: 'Estadisticas de pagos', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PaymentStats' } } } } } },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/payments/today': {
    get: {
      tags: ['Pagos'],
      summary: 'Pagos del dia',
      description: 'Obtiene todos los pagos registrados en el dia de hoy.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Pagos del dia',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      payments: { type: 'array', items: { $ref: '#/components/schemas/Payment' } },
                      total: { type: 'integer' },
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
