export const swaggerConfig = {
  openapi: '3.0.3',
  info: {
    title: 'API Instituto - Plataforma SaaS Educativa',
    description:
      'Documentacion completa de la API REST para la plataforma de gestion de instituciones educativas. ' +
      'Sistema multi-tenant con gestion de estudiantes, pagos, programas academicos, reportes y mas.',
    version: '1.0.0',
    contact: {
      name: 'KaledSoft',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desarrollo',
    },
  ],
  tags: [
    { name: 'Autenticacion', description: 'Registro, login, recuperacion de contrasena y sesion' },
    { name: 'Admin - Tenants', description: 'Gestion de tenants de la plataforma (solo super-admin)' },
    { name: 'Estudiantes', description: 'CRUD de estudiantes, informacion de pagos y recibos' },
    { name: 'Programas', description: 'Programas academicos del tenant' },
    { name: 'Usuarios', description: 'Gestion de usuarios del tenant' },
    { name: 'Roles', description: 'Consulta de roles disponibles' },
    { name: 'Pagos', description: 'Registro, consulta y estadisticas de pagos' },
    { name: 'Compromisos', description: 'Compromisos de pago (cuotas) de los estudiantes' },
    { name: 'Cartera', description: 'Gestion de cartera, deudas, alertas y resumen' },
    { name: 'Recibos', description: 'Generacion, descarga y envio de recibos de pago' },
    { name: 'Reportes', description: 'Dashboard, reportes financieros, por asesor, por programa y exportaciones' },
    { name: 'Contenido', description: 'Contenido academico y seguimiento de entregas' },
    { name: 'Configuracion', description: 'Configuracion del sistema por tenant' },
    { name: 'Invitaciones', description: 'Gestion de invitaciones para nuevos usuarios' },
    { name: 'WhatsApp', description: 'Envio de mensajes y recibos por WhatsApp' },
    { name: 'Branding', description: 'Personalizacion visual del tenant' },
    { name: 'Cron', description: 'Tareas programadas (notificaciones y suscripciones)' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey' as const,
        in: 'cookie' as const,
        name: 'session-token',
        description: 'Token de sesion almacenado en cookie HTTP-only. Si usas el formulario de login en /api-docs, no necesitas rellenar este campo manualmente.',
      },
      cronAuth: {
        type: 'http' as const,
        scheme: 'bearer',
        description: 'Token CRON_SECRET para autenticacion de tareas programadas (header Authorization: Bearer <token>)',
      },
    },
  },
};
