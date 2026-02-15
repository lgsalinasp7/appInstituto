export const commonSchemas = {
  SuccessResponse: {
    type: 'object' as const,
    properties: {
      success: { type: 'boolean' as const, example: true },
      message: { type: 'string' as const, example: 'Operacion exitosa' },
    },
  },
  ErrorResponse: {
    type: 'object' as const,
    properties: {
      success: { type: 'boolean' as const, example: false },
      error: { type: 'string' as const, example: 'Error de validacion' },
      details: {
        type: 'object' as const,
        description: 'Detalles de errores de validacion por campo',
        additionalProperties: { type: 'string' as const },
      },
    },
  },
  PaginatedMeta: {
    type: 'object' as const,
    properties: {
      total: { type: 'integer' as const, example: 100, description: 'Total de registros' },
      page: { type: 'integer' as const, example: 1, description: 'Pagina actual' },
      limit: { type: 'integer' as const, example: 10, description: 'Elementos por pagina' },
      totalPages: { type: 'integer' as const, example: 10, description: 'Total de paginas' },
    },
  },
};
