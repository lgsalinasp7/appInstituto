export const adminTenantsPaths = {
  '/api/admin/tenants': {
    get: {
      tags: ['Admin - Tenants'],
      summary: 'Listar tenants',
      description: 'Obtiene la lista paginada de todos los tenants de la plataforma con filtros opcionales. Requiere rol SUPER_ADMIN o ASESOR_COMERCIAL.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre o slug' },
        { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/TenantStatus' }, description: 'Filtrar por estado' },
        { name: 'plan', in: 'query', schema: { type: 'string' }, description: 'Filtrar por plan' },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numero de pagina' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Elementos por pagina' },
      ],
      responses: {
        200: {
          description: 'Lista de tenants',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      tenants: { type: 'array', items: { $ref: '#/components/schemas/Tenant' } },
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
        403: { description: 'Sin permisos de administrador de plataforma' },
      },
    },
    post: {
      tags: ['Admin - Tenants'],
      summary: 'Crear tenant',
      description: 'Crea un nuevo tenant en la plataforma. Se genera automaticamente un rol de administrador y un usuario admin para el tenant.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateTenantInput' },
            example: {
              name: 'Academia del Saber',
              slug: 'academia-del-saber',
              email: 'admin@academia-saber.com',
              plan: 'PROFESIONAL',
              subscriptionEndsAt: '2027-01-15T00:00:00.000Z',
            },
          },
        },
      },
      responses: {
        201: { description: 'Tenant creado exitosamente', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Tenant' } } } } } },
        400: { description: 'Datos invalidos o slug ya existe', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        401: { description: 'No autenticado' },
        403: { description: 'Sin permisos' },
      },
    },
  },
  '/api/admin/tenants/stats': {
    get: {
      tags: ['Admin - Tenants'],
      summary: 'Obtener estadisticas de tenants',
      description: 'Devuelve estadisticas generales de los tenants (total, activos, pendientes, suspendidos, cancelados). Requiere rol SUPER_ADMIN, ASESOR_COMERCIAL o MARKETING.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Estadisticas de tenants',
          content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/TenantStats' } } } } },
        },
        401: { description: 'No autenticado' },
        403: { description: 'Sin permisos' },
      },
    },
  },
  '/api/admin/tenants/{id}': {
    patch: {
      tags: ['Admin - Tenants'],
      summary: 'Actualizar tenant',
      description: 'Actualiza los datos de un tenant existente. Solo SUPER_ADMIN.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del tenant' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTenantInput' } } },
      },
      responses: {
        200: { description: 'Tenant actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Tenant' } } } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
        403: { description: 'Sin permisos' },
        404: { description: 'Tenant no encontrado' },
      },
    },
  },
  '/api/admin/tenants/{id}/activate': {
    post: {
      tags: ['Admin - Tenants'],
      summary: 'Activar tenant',
      description: 'Cambia el estado del tenant a ACTIVO. Requiere SUPER_ADMIN o ASESOR_COMERCIAL.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del tenant' },
      ],
      responses: {
        200: { description: 'Tenant activado', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        401: { description: 'No autenticado' },
        403: { description: 'Sin permisos' },
        404: { description: 'Tenant no encontrado' },
      },
    },
  },
  '/api/admin/tenants/{id}/suspend': {
    post: {
      tags: ['Admin - Tenants'],
      summary: 'Suspender tenant',
      description: 'Cambia el estado del tenant a SUSPENDIDO. Solo SUPER_ADMIN.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del tenant' },
      ],
      responses: {
        200: { description: 'Tenant suspendido', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        401: { description: 'No autenticado' },
        403: { description: 'Sin permisos' },
        404: { description: 'Tenant no encontrado' },
      },
    },
  },
  '/api/admin/tenants/{id}/reset-password': {
    post: {
      tags: ['Admin - Tenants'],
      summary: 'Resetear contrasena del admin del tenant',
      description: 'Genera una contrasena temporal para el usuario administrador del tenant. Si no se proporciona contrasena, se genera una aleatoria de 10 caracteres. Solo SUPER_ADMIN.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del tenant' },
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                password: { type: 'string', description: 'Contrasena nueva (opcional, se genera automaticamente si no se envia)', example: 'tempPass123' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Contrasena reseteada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', example: 'admin@instituto.com' },
                      tempPassword: { type: 'string', example: 'aB3dEf7gHi' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
        403: { description: 'Sin permisos' },
        404: { description: 'Tenant o usuario admin no encontrado' },
      },
    },
  },
  '/api/admin/tenants/{id}/branding': {
    get: {
      tags: ['Admin - Tenants'],
      summary: 'Obtener branding del tenant',
      description: 'Devuelve la configuracion de branding (colores, logo, fuentes) del tenant. Solo SUPER_ADMIN.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del tenant' },
      ],
      responses: {
        200: { description: 'Configuracion de branding', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/TenantBranding' } } } } } },
        401: { description: 'No autenticado' },
        403: { description: 'Sin permisos' },
      },
    },
    put: {
      tags: ['Admin - Tenants'],
      summary: 'Actualizar branding del tenant',
      description: 'Actualiza la configuracion visual del tenant (colores, logo, fuentes, CSS personalizado). Solo SUPER_ADMIN.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del tenant' },
      ],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateBrandingInput' } } },
      },
      responses: {
        200: { description: 'Branding actualizado', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/TenantBranding' } } } } } },
        400: { description: 'Datos invalidos (colores hex invalidos, URLs invalidas)' },
        401: { description: 'No autenticado' },
        403: { description: 'Sin permisos' },
      },
    },
  },
};
