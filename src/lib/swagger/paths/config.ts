export const configPaths = {
  '/api/config': {
    post: {
      tags: ['Configuracion'],
      summary: 'Establecer configuracion',
      description: 'Crea o actualiza un valor de configuracion del sistema para el tenant actual.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SetConfigInput' },
            example: { key: 'MONTHLY_GOAL', value: '15000000' },
          },
        },
      },
      responses: {
        200: {
          description: 'Configuracion guardada',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/SystemConfig' } } } } },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/config/{key}': {
    get: {
      tags: ['Configuracion'],
      summary: 'Obtener valor de configuracion',
      description: 'Obtiene el valor de una clave de configuracion del tenant. Para MONTHLY_GOAL, devuelve un valor por defecto si no esta configurado.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'key', in: 'path', required: true, schema: { type: 'string' }, description: 'Clave de configuracion', example: 'MONTHLY_GOAL' },
      ],
      responses: {
        200: {
          description: 'Valor de configuracion',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      key: { type: 'string', example: 'MONTHLY_GOAL' },
                      value: { type: 'string', example: '15000000' },
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
