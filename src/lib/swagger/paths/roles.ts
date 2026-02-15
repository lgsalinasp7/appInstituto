export const rolesPaths = {
  '/api/roles': {
    get: {
      tags: ['Roles'],
      summary: 'Listar roles del tenant',
      description: 'Obtiene la lista de roles disponibles para el tenant actual con su nombre, descripcion y permisos.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Lista de roles',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string', example: 'ADMINISTRADOR' },
                        description: { type: 'string', example: 'Administrador del instituto' },
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
