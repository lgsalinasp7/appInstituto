export const configSchemas = {
  SystemConfig: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const },
      key: { type: 'string' as const, example: 'MONTHLY_GOAL' },
      value: { type: 'string' as const, example: '15000000' },
      createdAt: { type: 'string' as const, format: 'date-time' as const },
      updatedAt: { type: 'string' as const, format: 'date-time' as const },
    },
  },
  SetConfigInput: {
    type: 'object' as const,
    required: ['key', 'value'],
    properties: {
      key: { type: 'string' as const, example: 'MONTHLY_GOAL' },
      value: { description: 'Valor de la configuracion (puede ser string, number u object)', example: '15000000' },
    },
  },
};
