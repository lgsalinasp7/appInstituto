export const programSchemas = {
  Program: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const, example: 'clx1234567890' },
      name: { type: 'string' as const, example: 'Tecnico en Desarrollo de Software' },
      description: { type: 'string' as const, nullable: true, example: 'Programa tecnico laboral en desarrollo de software con enfasis en aplicaciones web' },
      totalValue: { type: 'number' as const, example: 3500000, description: 'Valor total del programa en pesos' },
      matriculaValue: { type: 'number' as const, example: 60000, description: 'Valor de la matricula en pesos' },
      modulesCount: { type: 'integer' as const, example: 6, description: 'Cantidad de modulos del programa' },
      isActive: { type: 'boolean' as const, example: true },
      createdAt: { type: 'string' as const, format: 'date-time' as const },
      updatedAt: { type: 'string' as const, format: 'date-time' as const },
      _count: {
        type: 'object' as const,
        properties: {
          students: { type: 'integer' as const, example: 45 },
          prospects: { type: 'integer' as const, example: 12 },
        },
      },
    },
  },
  CreateProgramInput: {
    type: 'object' as const,
    required: ['name', 'totalValue', 'matriculaValue', 'modulesCount'],
    properties: {
      name: { type: 'string' as const, example: 'Auxiliar en Enfermeria' },
      description: { type: 'string' as const, example: 'Programa tecnico en auxiliar de enfermeria' },
      totalValue: { type: 'number' as const, example: 4200000 },
      matriculaValue: { type: 'number' as const, example: 60000 },
      modulesCount: { type: 'integer' as const, example: 8 },
      isActive: { type: 'boolean' as const, default: true },
    },
  },
  UpdateProgramInput: {
    type: 'object' as const,
    properties: {
      name: { type: 'string' as const },
      description: { type: 'string' as const },
      totalValue: { type: 'number' as const },
      matriculaValue: { type: 'number' as const },
      modulesCount: { type: 'integer' as const },
      isActive: { type: 'boolean' as const },
    },
  },
};
