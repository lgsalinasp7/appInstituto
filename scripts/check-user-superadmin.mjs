/**
 * Check user profile for superadmin@kaledsoft.tech
 * Run: node scripts/check-user-superadmin.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'superadmin@kaledsoft.tech' },
    include: {
      role: { select: { id: true, name: true, tenantId: true } },
      tenant: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!user) {
    console.log('Usuario no encontrado');
    return;
  }

  console.log(JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    tenantId: user.tenantId,
    platformRole: user.platformRole,
    roleId: user.roleId,
    role: user.role,
    tenant: user.tenant,
    isActive: user.isActive,
    invitationLimit: user.invitationLimit,
  }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
