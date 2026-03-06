/**
 * Debug script: test TenantsService.getByIdOrSlug with the same code path as the app
 * Run: node scripts/debug-tenant-by-id.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const idOrSlug = 'cmm76nr4a0000vstwszautln3';

async function main() {
  console.log('Testing getByIdOrSlug for:', idOrSlug);
  
  const slugVariants =
    idOrSlug.toLowerCase() === 'kaledacademy'
      ? ['kaledacademy', 'kaled-academy']
      : [idOrSlug];

  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        ...slugVariants.map((s) => ({ slug: { equals: s, mode: 'insensitive' } })),
      ],
    },
    include: {
      users: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: {
          users: true,
          students: true,
          payments: true,
        },
      },
      branding: {
        select: { logoUrl: true },
      },
    },
  });

  console.log('Result:', tenant ? 'FOUND' : 'NULL');
  if (tenant) {
    console.log('Tenant name:', tenant.name);
    console.log('Tenant id:', tenant.id);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
