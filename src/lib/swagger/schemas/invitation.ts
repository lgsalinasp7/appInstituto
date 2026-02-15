export const invitationSchemas = {
  Invitation: {
    type: 'object' as const,
    properties: {
      id: { type: 'string' as const, example: 'clx1234567890' },
      email: { type: 'string' as const, format: 'email' as const, example: 'nuevo.usuario@email.com' },
      roleId: { type: 'string' as const },
      status: { $ref: '#/components/schemas/InvitationStatus' },
      token: { type: 'string' as const },
      expiresAt: { type: 'string' as const, format: 'date-time' as const },
      inviterId: { type: 'string' as const },
      createdAt: { type: 'string' as const, format: 'date-time' as const },
      updatedAt: { type: 'string' as const, format: 'date-time' as const },
      role: { $ref: '#/components/schemas/Role' },
      inviter: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' as const },
          name: { type: 'string' as const, example: 'Admin Principal' },
          email: { type: 'string' as const, example: 'admin@instituto.com' },
        },
      },
    },
  },
  CreateInvitationInput: {
    type: 'object' as const,
    required: ['email', 'roleId', 'inviterId'],
    properties: {
      email: { type: 'string' as const, format: 'email' as const, example: 'nuevo.asesor@email.com' },
      roleId: { type: 'string' as const, example: 'clx_role_ventas' },
      inviterId: { type: 'string' as const, example: 'clx_user_admin' },
    },
  },
  AcceptInvitationInput: {
    type: 'object' as const,
    required: ['token', 'name', 'password'],
    properties: {
      token: { type: 'string' as const, example: 'abc123def456' },
      name: { type: 'string' as const, example: 'Laura Gomez Perez' },
      password: { type: 'string' as const, minLength: 6, example: 'miPassword123' },
    },
  },
};
