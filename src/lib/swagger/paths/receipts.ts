export const receiptsPaths = {
  '/api/receipts/{id}': {
    get: {
      tags: ['Recibos'],
      summary: 'Obtener recibo',
      description: 'Obtiene los datos del recibo por numero de recibo o ID de pago. Si el recibo no existe, se crea automaticamente.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Numero de recibo (REC-YYYYMM-NNNNN) o ID del pago' }],
      responses: {
        200: { description: 'Datos del recibo', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Receipt' } } } } } },
        401: { description: 'No autenticado' },
        404: { description: 'Recibo no encontrado' },
      },
    },
  },
  '/api/receipts/{id}/send': {
    post: {
      tags: ['Recibos'],
      summary: 'Enviar recibo',
      description: 'Envia el recibo al estudiante por WhatsApp o email.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del recibo' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['via'],
              properties: {
                via: { type: 'string', enum: ['whatsapp', 'email'], example: 'whatsapp' },
                phoneNumber: { type: 'string', example: '3001234567', description: 'Numero para WhatsApp (opcional, usa el del estudiante si no se envia)' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Recibo enviado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      whatsappUrl: { type: 'string', example: 'https://wa.me/573001234567?text=...', description: 'URL de WhatsApp (solo si via=whatsapp)' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
        404: { description: 'Recibo no encontrado' },
      },
    },
  },
  '/api/receipts/{id}/whatsapp': {
    get: {
      tags: ['Recibos'],
      summary: 'Generar URL de WhatsApp',
      description: 'Genera una URL de WhatsApp con el mensaje del recibo formateado para enviar al estudiante.',
      security: [{ cookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del recibo' },
        { name: 'phone', in: 'query', schema: { type: 'string' }, description: 'Numero de telefono (opcional)' },
      ],
      responses: {
        200: {
          description: 'URL de WhatsApp generada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      url: { type: 'string', example: 'https://wa.me/573001234567?text=...' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: 'No autenticado' },
        404: { description: 'Recibo no encontrado' },
      },
    },
  },
  '/api/receipts/{id}/download': {
    get: {
      tags: ['Recibos'],
      summary: 'Descargar recibo en PDF',
      description: 'Genera y descarga el recibo de pago en formato PDF.',
      security: [{ cookieAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del recibo' }],
      responses: {
        200: {
          description: 'Archivo PDF del recibo',
          content: {
            'application/pdf': {
              schema: { type: 'string', format: 'binary' },
            },
          },
        },
        401: { description: 'No autenticado' },
        404: { description: 'Recibo no encontrado' },
      },
    },
  },
};
