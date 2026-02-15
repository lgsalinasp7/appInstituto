export const usersPaths = {
  '/api/users': {
    get: {
      tags: ['Usuarios'],
      summary: 'Listar usuarios del tenant',
      description: 'Obtiene la lista de usuarios del tenant actual con filtros opcionales.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'role', in: 'query', schema: { type: 'string', enum: ['advisor'] }, description: 'Filtrar por tipo de rol (advisor filtra ADMINISTRADOR y VENTAS)' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre o email' },
        { name: 'showSuperAdmin', in: 'query', schema: { type: 'boolean', default: false }, description: 'Incluir informacion del invitador' },
      ],
      responses: {
        200: {
          description: 'Lista de usuarios',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/users/{id}': {
    get: {
      tags: ['Usuarios'],
      summary: 'Obtener usuario por ID',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Datos del usuario', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Usuario no encontrado' },
      },
    },
    put: {
      tags: ['Usuarios'],
      summary: 'Actualizar usuario',
      description: 'Actualiza los datos de un usuario. No se puede modificar usuarios SUPERADMIN.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserInput' } } } },
      responses: {
        200: { description: 'Usuario actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/User' } } } } } },
        400: { description: 'Datos invalidos o email duplicado' },
        401: { description: 'No autenticado' },
        403: { description: 'No se puede modificar SUPERADMIN' },
        404: { description: 'Usuario no encontrado' },
      },
    },
    delete: {
      tags: ['Usuarios'],
      summary: 'Eliminar usuario',
      description: 'Desactiva (soft delete) un usuario del tenant. El usuario queda con isActive=false.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Usuario desactivado', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Usuario no encontrado' },
      },
    },
  },
};
