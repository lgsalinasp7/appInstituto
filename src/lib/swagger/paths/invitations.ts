export const invitationsPaths = {
  '/api/invitations': {
    get: {
      tags: ['Invitaciones'],
      summary: 'Listar invitaciones',
      description: 'Obtiene la lista de invitaciones del tenant con filtros opcionales.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'inviterId', in: 'query', schema: { type: 'string' }, description: 'Filtrar por quien invito' },
        { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/InvitationStatus' }, description: 'Filtrar por estado' },
      ],
      responses: {
        200: {
          description: 'Lista de invitaciones',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: { type: 'array', items: { $ref: '#/components/schemas/Invitation' } },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
      },
    },
    post: {
      tags: ['Invitaciones'],
      summary: 'Crear invitacion',
      description: 'Envia una invitacion por email para unirse al tenant con un rol especifico. Valida limites de invitaciones para ADMINISTRADOR.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateInvitationInput' },
            example: { email: 'nuevo.asesor@email.com', roleId: 'clx_role_ventas', inviterId: 'clx_user_admin' },
          },
        },
      },
      responses: {
        201: { description: 'Invitacion creada y email enviado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Invitation' } } } } } },
        400: { description: 'Email invalido, limite alcanzado o invitacion duplicada' },
        401: { description: 'No autenticado' },
      },
    },
  },
  '/api/invitations/accept': {
    get: {
      tags: ['Invitaciones'],
      summary: 'Validar token de invitacion',
      description: 'Valida si un token de invitacion es valido y no ha expirado. Usado para mostrar el formulario de aceptacion.',
      parameters: [
        { name: 'token', in: 'query', required: true, schema: { type: 'string' }, description: 'Token de invitacion' },
      ],
      responses: {
        200: {
          description: 'Token valido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', example: 'nuevo.asesor@email.com' },
                      role: { type: 'string', example: 'VENTAS' },
                      tenantName: { type: 'string', example: 'Instituto Educativo Elite' },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: 'Token invalido o expirado' },
      },
    },
    post: {
      tags: ['Invitaciones'],
      summary: 'Aceptar invitacion',
      description: 'Acepta una invitacion creando la cuenta de usuario con el nombre y contrasena proporcionados. El token expira despues de 7 dias.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AcceptInvitationInput' },
            example: { token: 'abc123def456', name: 'Laura Gomez Perez', password: 'miPassword123' },
          },
        },
      },
      responses: {
        201: {
          description: 'Cuenta creada exitosamente',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string', example: 'Cuenta creada exitosamente' } } } } },
        },
        400: { description: 'Token invalido, expirado o datos incompletos' },
      },
    },
  },
  '/api/invitations/{id}': {
    get: {
      tags: ['Invitaciones'],
      summary: 'Obtener invitacion por ID',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Datos de la invitacion', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Invitation' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Invitacion no encontrada' },
      },
    },
    delete: {
      tags: ['Invitaciones'],
      summary: 'Cancelar invitacion',
      description: 'Cancela una invitacion pendiente. Solo se pueden cancelar invitaciones con estado PENDING.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Invitacion cancelada', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        400: { description: 'Solo se pueden cancelar invitaciones pendientes' },
        401: { description: 'No autenticado' },
        404: { description: 'Invitacion no encontrada' },
      },
    },
  },
};
