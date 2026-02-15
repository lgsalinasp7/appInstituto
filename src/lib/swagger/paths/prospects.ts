export const prospectsPaths = {
  '/api/prospects': {
    get: {
      tags: ['Prospectos'],
      summary: 'Listar prospectos',
      description: 'Obtiene la lista paginada de prospectos del tenant actual con filtros opcionales.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre, telefono o email' },
        { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/ProspectStatus' }, description: 'Filtrar por estado' },
        { name: 'programId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por programa de interes' },
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor asignado' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
      ],
      responses: {
        200: {
          description: 'Lista de prospectos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      prospects: { type: 'array', items: { $ref: '#/components/schemas/Prospect' } },
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
      tags: ['Prospectos'],
      summary: 'Crear prospecto',
      description: 'Registra un nuevo prospecto (lead) en el sistema.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateProspectInput' },
            example: {
              name: 'Ana Sofia Ramirez Mejia',
              phone: '3157654321',
              email: 'ana.ramirez@email.com',
              status: 'CONTACTADO',
              observations: 'Interesada en programa de enfermeria',
              programId: 'clx_program_002',
              advisorId: 'clx_user_001',
            },
          },
        },
      },
      responses: {
        201: { description: 'Prospecto creado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Prospect' } } } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/prospects/{id}': {
    get: {
      tags: ['Prospectos'],
      summary: 'Obtener prospecto por ID',
      description: 'Devuelve los datos completos del prospecto con programa y asesor.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Datos del prospecto', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Prospect' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Prospecto no encontrado' },
      },
    },
    patch: {
      tags: ['Prospectos'],
      summary: 'Actualizar prospecto',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProspectInput' } } } },
      responses: {
        200: { description: 'Prospecto actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Prospect' } } } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
        404: { description: 'Prospecto no encontrado' },
      },
    },
    delete: {
      tags: ['Prospectos'],
      summary: 'Eliminar prospecto',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Prospecto eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Prospecto no encontrado' },
      },
    },
  },
  '/api/prospects/{id}/convert': {
    post: {
      tags: ['Prospectos'],
      summary: 'Convertir prospecto a estudiante',
      description: 'Convierte un prospecto en estudiante, creando el registro de estudiante y cambiando el estado del prospecto a CERRADO.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del prospecto' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ConvertProspectInput' },
            example: {
              documentType: 'CC',
              documentNumber: '1098765432',
              address: 'Calle 45 # 12-34',
              enrollmentDate: '2026-02-15',
              initialPayment: 60000,
              totalProgramValue: 3500000,
            },
          },
        },
      },
      responses: {
        201: { description: 'Prospecto convertido a estudiante', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Student' } } } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
        404: { description: 'Prospecto no encontrado' },
      },
    },
  },
  '/api/prospects/{id}/interactions': {
    get: {
      tags: ['Prospectos'],
      summary: 'Listar interacciones del prospecto',
      description: 'Obtiene el historial de interacciones registradas con el prospecto.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Lista de interacciones', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/ProspectInteraction' } } } } } } },
        401: { description: 'No autenticado' },
      },
    },
    post: {
      tags: ['Prospectos'],
      summary: 'Registrar interaccion',
      description: 'Registra una nueva interaccion con el prospecto (llamada, WhatsApp, email, reunion).',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateInteractionInput' },
            example: { type: 'WHATSAPP', content: 'Se contacto por WhatsApp, mostrando interes', advisorId: 'clx_user_001' },
          },
        },
      },
      responses: {
        201: { description: 'Interaccion registrada', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/ProspectInteraction' } } } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/prospects/stats': {
    get: {
      tags: ['Prospectos'],
      summary: 'Estadisticas de prospectos',
      description: 'Obtiene estadisticas de prospectos: total, distribucion por estado, tasa de conversion y prospectos del mes.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor' },
      ],
      responses: {
        200: { description: 'Estadisticas', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/ProspectStats' } } } } } },
        401: { description: 'No autenticado' },
      },
    },
  },
};
