export const studentsPaths = {
  '/api/students': {
    get: {
      tags: ['Estudiantes'],
      summary: 'Listar estudiantes',
      description: 'Obtiene la lista paginada de estudiantes del tenant actual con filtros opcionales.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre o numero de documento' },
        { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/StudentStatus' }, description: 'Filtrar por estado' },
        { name: 'programId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por programa' },
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numero de pagina' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Elementos por pagina' },
      ],
      responses: {
        200: {
          description: 'Lista de estudiantes con informacion de pagos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      students: { type: 'array', items: { $ref: '#/components/schemas/Student' } },
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
        401: { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      },
    },
    post: {
      tags: ['Estudiantes'],
      summary: 'Crear estudiante',
      description: 'Registra un nuevo estudiante con su pago de matricula. Automaticamente crea el registro de pago de matricula y el primer compromiso de pago.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateStudentInput' },
            example: {
              fullName: 'Maria Fernanda Lopez Garcia',
              documentType: 'CC',
              documentNumber: '1098765432',
              email: 'maria.lopez@email.com',
              phone: '3001234567',
              address: 'Calle 45 # 12-34, Bucaramanga',
              enrollmentDate: '2026-01-15',
              initialPayment: 60000,
              totalProgramValue: 3500000,
              programId: 'clx_program_001',
              advisorId: 'clx_user_001',
              paymentFrequency: 'MENSUAL',
              firstCommitmentDate: '2026-02-15',
              paymentMethod: 'NEQUI',
              paymentReference: 'REF-12345',
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Estudiante creado con pago de matricula registrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Student' },
                  message: { type: 'string', example: 'Estudiante matriculado exitosamente' },
                },
              },
            },
          },
        },
        400: { description: 'Datos invalidos o documento duplicado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/students/{id}': {
    get: {
      tags: ['Estudiantes'],
      summary: 'Obtener estudiante por ID',
      description: 'Devuelve los datos completos del estudiante incluyendo programa, asesor, pagos y saldo.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del estudiante' },
      ],
      responses: {
        200: { description: 'Datos del estudiante', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Student' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Estudiante no encontrado' },
      },
    },
    patch: {
      tags: ['Estudiantes'],
      summary: 'Actualizar estudiante',
      description: 'Actualiza los datos de un estudiante existente.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del estudiante' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateStudentInput' } } },
      },
      responses: {
        200: { description: 'Estudiante actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Student' } } } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
        404: { description: 'Estudiante no encontrado' },
      },
    },
    delete: {
      tags: ['Estudiantes'],
      summary: 'Eliminar estudiante',
      description: 'Elimina un estudiante y todos sus registros asociados (pagos, recibos, compromisos, entregas de contenido).',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del estudiante' },
      ],
      responses: {
        200: { description: 'Estudiante eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Estudiante no encontrado' },
      },
    },
  },
  '/api/students/{id}/payment-info': {
    get: {
      tags: ['Estudiantes'],
      summary: 'Obtener informacion de pagos del estudiante',
      description: 'Devuelve un resumen de pagos del estudiante incluyendo valor por modulo, pago minimo, saldo pendiente y compromisos.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del estudiante' },
      ],
      responses: {
        200: { description: 'Informacion de pagos', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/StudentPaymentInfo' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Estudiante no encontrado' },
      },
    },
  },
  '/api/students/{id}/receipt': {
    get: {
      tags: ['Estudiantes'],
      summary: 'Obtener recibo de matricula',
      description: 'Devuelve los datos del recibo de matricula del estudiante incluyendo pago inicial y primer compromiso.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del estudiante' },
      ],
      responses: {
        200: {
          description: 'Datos del recibo de matricula',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      student: { $ref: '#/components/schemas/Student' },
                      payment: { $ref: '#/components/schemas/Payment' },
                      commitment: { $ref: '#/components/schemas/PaymentCommitment' },
                      program: { $ref: '#/components/schemas/Program' },
                      registeredBy: { type: 'object', properties: { name: { type: 'string' } } },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
        404: { description: 'Estudiante no encontrado' },
      },
    },
  },
  '/api/students/{id}/payments': {
    get: {
      tags: ['Estudiantes'],
      summary: 'Obtener resumen de pagos del estudiante',
      description: 'Devuelve el resumen de pagos del estudiante con el historial completo.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del estudiante' },
      ],
      responses: {
        200: {
          description: 'Resumen de pagos',
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
                      totalPaid: { type: 'number', example: 540000 },
                      remainingBalance: { type: 'number', example: 2960000 },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
        404: { description: 'Estudiante no encontrado' },
      },
    },
  },
};
