export const tenantBrandingPaths = {
  '/api/tenant/branding': {
    get: {
      tags: ['Branding'],
      summary: 'Obtener branding del tenant actual',
      description: 'Devuelve la configuracion de branding (colores, logo, fuentes) del tenant autenticado. Si no existe configuracion, devuelve valores por defecto.',
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: 'Configuracion de branding',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TenantBranding' } } },
        },
        401: { description: 'No autenticado' },
      },
    },
  },
};
