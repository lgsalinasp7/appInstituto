export const userSchemas = {
  User: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const, example: 'clx1234567890' },
      email: { type: 'string' as const, format: 'email' as const, example: 'usuario@instituto.com' },
      name: { type: 'string' as const, nullable: true, example: 'Carlos Andres Martinez' },
      image: { type: 'string' as const, nullable: true },
      isActive: { type: 'boolean' as const, example: true },
      platformRole: { $ref: '#/components/schemas/PlatformRole' },
      invitationLimit: { type: 'integer' as const, example: 5 },
      tenantId: { type: 'string' as const, nullable: true },
      createdAt: { type: 'string' as const, format: 'date-time' as const },
      updatedAt: { type: 'string' as const, format: 'date-time' as const },
      role: { $ref: '#/components/schemas/Role' },
      profile: { $ref: '#/components/schemas/Profile' },
    },
  },
  UpdateUserInput: {
    type: 'object' as const,
    properties: {
      name: { type: 'string' as const, example: 'Carlos Martinez' },
      email: { type: 'string' as const, format: 'email' as const },
      isActive: { type: 'boolean' as const },
      invitationLimit: { type: 'integer' as const, example: 10 },
    },
  },
  AuthUser: {
    type: 'object' as const,
    description: 'Usuario autenticado devuelto por /api/auth/me',
    properties: {
      id: { type: 'string' as const },
      email: { type: 'string' as const, format: 'email' as const, example: 'admin@instituto.com' },
      name: { type: 'string' as const, example: 'Admin Principal' },
      tenantId: { type: 'string' as const },
      platformRole: { $ref: '#/components/schemas/PlatformRole' },
      role: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          name: { type: 'string' as const, example: 'ADMINISTRADOR' },
          permissions: { type: 'array' as const, items: { type: 'string' as const }, example: ['USERS_READ', 'USERS_CREATE'] },
        },
      },
      isActive: { type: 'boolean' as const, example: true },
    },
  },
  Role: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const, example: 'clx1234567890' },
      name: { type: 'string' as const, example: 'ADMINISTRADOR' },
      description: { type: 'string' as const, nullable: true, example: 'Administrador del instituto' },
      permissions: {
        type: 'array' as const,
        items: { type: 'string' as const },
        example: ['USERS_READ', 'USERS_CREATE', 'USERS_UPDATE', 'ADMIN_ACCESS'],
      },
      _count: {
        type: 'object' as const,
        properties: {
          users: { type: 'integer' as const, example: 3 },
        },
      },
    },
  },
  Profile: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const },
      bio: { type: 'string' as const, nullable: true },
      phone: { type: 'string' as const, nullable: true, example: '3001234567' },
      address: { type: 'string' as const, nullable: true, example: 'Calle 45 # 12-34, Bucaramanga' },
      dateOfBirth: { type: 'string' as const, format: 'date-time' as const, nullable: true },
    },
  },
};
