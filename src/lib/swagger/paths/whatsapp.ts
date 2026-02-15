export const whatsappPaths = {
  '/api/whatsapp/send-receipt': {
    post: {
      tags: ['WhatsApp'],
      summary: 'Enviar recibo por WhatsApp',
      description: 'Envia un mensaje con el recibo de pago por la API de WhatsApp Business de Meta. Soporta envio de texto e imagenes.',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['phone', 'message'],
              properties: {
                phone: { type: 'string', example: '3001234567', description: 'Numero de telefono del destinatario (se agrega codigo de pais 57 automaticamente)' },
                message: { type: 'string', example: 'Recibo de pago #REC-202602-00001...' },
                imageUrl: { type: 'string', format: 'uri', description: 'URL de imagen para adjuntar (opcional)' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Mensaje enviado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
        400: { description: 'Datos invalidos' },
        401: { description: 'No autenticado' },
        500: { description: 'Error al enviar (WhatsApp API no configurada o error de servicio)' },
      },
    },
  },
};
