export const commitmentsPaths = {
  '/api/commitments': {
    get: {
      tags: ['Compromisos'],
      summary: 'Listar compromisos de pago',
      description: 'Obtiene la lista de compromisos de pago (cuotas) con filtros opcionales.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/CommitmentStatus' }, description: 'Filtrar por estado' },
        { name: 'studentId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por estudiante' },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha inicio' },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha fin' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
      ],
      responses: {
        200: {
          description: 'Lista de compromisos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { type: 'array', items: { $ref: '#/components/schemas/PaymentCommitment' } },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/commitments/{id}': {
    patch: {
      tags: ['Compromisos'],
      summary: 'Actualizar compromiso',
      description: 'Actualiza los datos de un compromiso de pago (fecha, monto, estado, comentarios).',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del compromiso' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                scheduledDate: { type: 'string', format: 'date' },
                amount: { type: 'number' },
                status: { $ref: '#/components/schemas/CommitmentStatus' },
                rescheduledDate: { type: 'string', format: 'date' },
                comments: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Compromiso actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PaymentCommitment' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Compromiso no encontrado' },
      },
    },
  },
  '/api/commitments/{id}/paid': {
    post: {
      tags: ['Compromisos'],
      summary: 'Marcar compromiso como pagado',
      description: 'Cambia el estado del compromiso a PAGADO.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del compromiso' }],
      responses: {
        200: { description: 'Compromiso marcado como pagado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PaymentCommitment' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Compromiso no encontrado' },
      },
    },
  },
  '/api/commitments/{id}/reschedule': {
    post: {
      tags: ['Compromisos'],
      summary: 'Reprogramar compromiso',
      description: 'Reprograma la fecha de un compromiso de pago y cambia su estado a EN_COMPROMISO.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del compromiso' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['newDate'],
              properties: {
                newDate: { type: 'string', format: 'date', example: '2026-03-20', description: 'Nueva fecha de pago' },
                comments: { type: 'string', example: 'Estudiante solicito extension por motivos personales' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Compromiso reprogramado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PaymentCommitment' } } } } } },
        400: { description: 'Fecha invalida' },
        401: { description: 'No autenticado' },
        404: { description: 'Compromiso no encontrado' },
      },
    },
  },
};
