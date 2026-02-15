export const programsPaths = {
  '/api/programs': {
    get: {
      tags: ['Programas'],
      summary: 'Listar programas',
      description: 'Obtiene todos los programas academicos del tenant. Incluye conteo de estudiantes y prospectos.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'includeInactive', in: 'query', schema: { type: 'boolean', default: false }, description: 'Incluir programas inactivos' },
      ],
      responses: {
        200: {
          description: 'Lista de programas',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      programs: { type: 'array', items: { $ref: '#/components/schemas/Program' } },
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
    post: {
      tags: ['Programas'],
      summary: 'Crear programa',
      description: 'Crea un nuevo programa academico. El nombre debe ser unico por tenant.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateProgramInput' },
            example: { name: 'Auxiliar en Enfermeria', description: 'Programa tecnico en auxiliar de enfermeria', totalValue: 4200000, matriculaValue: 60000, modulesCount: 8 },
          },
        },
      },
      responses: {
        201: { description: 'Programa creado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Program' } } } } } },
        400: { description: 'Datos invalidos o nombre duplicado' },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/programs/{id}': {
    get: {
      tags: ['Programas'],
      summary: 'Obtener programa por ID',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Datos del programa', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Program' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Programa no encontrado' },
      },
    },
    put: {
      tags: ['Programas'],
      summary: 'Actualizar programa',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProgramInput' } } } },
      responses: {
        200: { description: 'Programa actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Program' } } } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
        404: { description: 'Programa no encontrado' },
      },
    },
    delete: {
      tags: ['Programas'],
      summary: 'Eliminar programa',
      description: 'Elimina un programa. No se puede eliminar si tiene estudiantes matriculados.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Programa eliminado', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        400: { description: 'No se puede eliminar (tiene estudiantes matriculados)' },
        401: { description: 'No autenticado' },
        404: { description: 'Programa no encontrado' },
      },
    },
  },
};
