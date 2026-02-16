export const authPaths = {
  '/api/auth/login': {
    post: {
      tags: ['Autenticacion'],
      summary: 'Iniciar sesion',
      description:
        'Autentica un usuario con email y contrasena. Establece una cookie HTTP-only `session_token` que se envia automaticamente en las siguientes peticiones.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'admin@miinstituto.edu.co' },
                password: { type: 'string', minLength: 6, example: 'miPassword123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Inicio de sesion exitoso. Se establece la cookie `session_token`.',
          headers: {
            'Set-Cookie': {
              description: 'Cookie de sesion HTTP-only',
              schema: { type: 'string', example: 'session_token=abc123; Path=/; HttpOnly; SameSite=Lax' },
            },
          },
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string', example: 'admin@miinstituto.edu.co' },
                      name: { type: 'string', example: 'Carlos Admin' },
                      role: { type: 'string', example: 'ADMIN', nullable: true },
                    },
                  },
                  message: { type: 'string', example: 'Inicio de sesion exitoso' },
                },
              },
            },
          },
        },
        400: { description: 'Datos invalidos (email o contrasena no cumplen formato)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        401: { description: 'Credenciales invalidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        429: { description: 'Demasiados intentos de inicio de sesion (rate limit)' },
      },
    },
  },
  '/api/auth/register': {
    post: {
      tags: ['Autenticacion'],
      summary: 'Registrar nuevo usuario',
      description: 'Crea una nueva cuenta de usuario. Se asigna automaticamente el rol de estudiante/usuario.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'password'],
              properties: {
                name: { type: 'string', minLength: 2, example: 'Maria Fernanda Lopez' },
                email: { type: 'string', format: 'email', example: 'maria.lopez@email.com' },
                password: { type: 'string', minLength: 6, example: 'miPassword123' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Usuario registrado exitosamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string', example: 'Maria Fernanda Lopez' },
                      email: { type: 'string', example: 'maria.lopez@email.com' },
                      role: { type: 'string', example: 'user' },
                    },
                  },
                  message: { type: 'string', example: 'Usuario registrado exitosamente' },
                },
              },
            },
          },
        },
        400: { description: 'Datos invalidos o email ya registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        429: { description: 'Demasiados intentos (rate limit)' },
      },
    },
  },
  '/api/auth/forgot-password': {
    post: {
      tags: ['Autenticacion'],
      summary: 'Solicitar recuperacion de contrasena',
      description: 'Envia un email con un enlace para restablecer la contrasena. Por seguridad, siempre responde exitosamente aunque el email no exista.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', format: 'email', example: 'maria.lopez@email.com' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Solicitud procesada (respuesta generica por seguridad)',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
        },
        429: { description: 'Demasiados intentos (rate limit)' },
      },
    },
  },
  '/api/auth/reset-password': {
    post: {
      tags: ['Autenticacion'],
      summary: 'Restablecer contrasena',
      description: 'Restablece la contrasena usando el token recibido por email. El token expira despues de 1 hora.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token', 'password'],
              properties: {
                token: { type: 'string', example: 'abc123def456' },
                password: { type: 'string', minLength: 6, example: 'nuevoPassword123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Contrasena restablecida exitosamente',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
        },
        400: { description: 'Token invalido o expirado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        429: { description: 'Demasiados intentos (rate limit)' },
      },
    },
  },
  '/api/auth/logout': {
    post: {
      tags: ['Autenticacion'],
      summary: 'Cerrar sesion',
      description: 'Destruye la sesion actual y elimina la cookie `session_token`.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Sesion cerrada exitosamente',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
        },
        500: { description: 'Error al cerrar sesion', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      },
    },
  },
  '/api/auth/me': {
    get: {
      tags: ['Autenticacion'],
      summary: 'Obtener usuario actual',
      description: 'Devuelve la informacion del usuario autenticado actualmente, incluyendo su rol y permisos.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Informacion del usuario autenticado',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthUser' } } },
        },
        401: { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
      },
    },
  },
};
