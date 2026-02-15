export const cronPaths = {
  '/api/cron/notifications': {
    get: {
      tags: ['Cron'],
      summary: 'Enviar notificaciones de pago',
      description: 'Tarea programada que envia recordatorios de pago por WhatsApp. Notifica 7 dias antes, 3 dias antes y 1 dia antes de la fecha de vencimiento. Se ejecuta diariamente a las 9 AM.',
      security: [{ cronAuth: [] }],
      responses: {
        200: {
          description: 'Notificaciones procesadas',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      processed: { type: 'integer', example: 15, description: 'Cantidad de notificaciones procesadas' },
                      sent: { type: 'integer', example: 12, description: 'Cantidad enviadas exitosamente' },
                      failed: { type: 'integer', example: 3, description: 'Cantidad que fallaron' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Token CRON_SECRET invalido' },
      },
    },
  },
  '/api/cron/process-subscriptions': {
    get: {
      tags: ['Cron'],
      summary: 'Procesar suscripciones vencidas',
      description: 'Tarea programada que verifica las suscripciones de tenants y suspende automaticamente los que tienen la suscripcion vencida. Se ejecuta diariamente a medianoche.',
      security: [{ cronAuth: [] }],
      responses: {
        200: {
          description: 'Suscripciones procesadas',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      suspended: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string', example: 'Instituto Ejemplo' },
                            subscriptionEndsAt: { type: 'string', format: 'date-time' },
                          },
                        },
                        description: 'Lista de tenants suspendidos',
                      },
                      count: { type: 'integer', example: 2, description: 'Cantidad de tenants suspendidos' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'Token CRON_SECRET invalido' },
      },
    },
  },
};
