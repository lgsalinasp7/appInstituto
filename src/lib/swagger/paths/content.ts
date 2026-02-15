export const contentPaths = {
  '/api/content': {
    get: {
      tags: ['Contenido'],
      summary: 'Listar contenido academico',
      description: 'Obtiene la lista de contenidos academicos de un programa, ordenados por indice.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'programId', in: 'query', required: true, schema: { type: 'string' }, description: 'ID del programa (requerido)' },
      ],
      responses: {
        200: {
          description: 'Lista de contenidos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { type: 'array', items: { $ref: '#/components/schemas/AcademicContent' } },
                },
              },
            },
          },
        },
        400: { description: 'programId es requerido' },
        401: { description: 'No autenticado' },
      },
    },
    post: {
      tags: ['Contenido'],
      summary: 'Crear contenido academico',
      description: 'Crea un nuevo contenido academico asociado a un programa.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateContentInput' },
            example: { name: 'Modulo 3 - Bases de Datos', description: 'Fundamentos de bases de datos relacionales', orderIndex: 3, programId: 'clx_program_001' },
          },
        },
      },
      responses: {
        201: { description: 'Contenido creado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/AcademicContent' } } } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/content/{id}': {
    patch: {
      tags: ['Contenido'],
      summary: 'Actualizar contenido',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateContentInput' } } } },
      responses: {
        200: { description: 'Contenido actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/AcademicContent' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Contenido no encontrado' },
      },
    },
    delete: {
      tags: ['Contenido'],
      summary: 'Eliminar contenido',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Contenido eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Contenido no encontrado' },
      },
    },
  },
  '/api/content/deliver': {
    post: {
      tags: ['Contenido'],
      summary: 'Entregar contenido a estudiante',
      description: 'Registra la entrega de un contenido academico a un estudiante. Verifica que el contenido este disponible segun los pagos realizados.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/DeliverContentInput' },
            example: { studentId: 'clx_student_001', contentId: 'clx_content_001', method: 'whatsapp' },
          },
        },
      },
      responses: {
        201: { description: 'Contenido entregado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/ContentDelivery' } } } } } },
        400: { description: 'Contenido ya entregado o no disponible' },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/content/pending': {
    get: {
      tags: ['Contenido'],
      summary: 'Entregas de contenido pendientes',
      description: 'Obtiene la lista de estudiantes con contenido pendiente de entregar, basado en los pagos realizados.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'advisorId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por asesor' },
      ],
      responses: {
        200: {
          description: 'Lista de entregas pendientes',
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
                        studentId: { type: 'string' },
                        studentName: { type: 'string' },
                        programName: { type: 'string' },
                        pendingContents: { type: 'array', items: { $ref: '#/components/schemas/AcademicContent' } },
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
  '/api/content/student/{studentId}': {
    get: {
      tags: ['Contenido'],
      summary: 'Estado de contenido del estudiante',
      description: 'Obtiene el estado completo de contenidos del estudiante: disponibles, entregados y pendientes, basado en los pagos realizados.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del estudiante' }],
      responses: {
        200: { description: 'Estado de contenido', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/StudentContentStatus' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Estudiante no encontrado' },
      },
    },
  },
};
