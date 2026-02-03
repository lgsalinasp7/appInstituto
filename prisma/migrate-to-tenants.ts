import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('starting migration to multi-tenancy...');

    // 1. Create a default tenant
    const defaultTenant = await prisma.tenant.upsert({
        where: { slug: 'default' },
        update: {},
        create: {
            name: 'Default Institution',
            slug: 'default',
        },
    });

    console.log(`Default tenant created/found: ${defaultTenant.id}`);

    // 2. Assign all existing records to the default tenant
    const tenantId = defaultTenant.id;

    console.log('migrating users...');
    await prisma.user.updateMany({
        where: { tenantId: { equals: undefined } as any }, // Prisma might complain if we use a non-existent field, but since we updated schema, it should work
        data: { tenantId },
    });

    console.log('migrating roles...');
    await prisma.role.updateMany({
        where: { tenantId: { equals: undefined } as any },
        data: { tenantId },
    });

    console.log('migrating programs...');
    await prisma.program.updateMany({
        where: { tenantId: { equals: undefined } as any },
        data: { tenantId },
    });

    console.log('migrating students...');
    await prisma.student.updateMany({
        where: { tenantId: { equals: undefined } as any },
        data: { tenantId },
    });

    console.log('migrating payments...');
    await prisma.payment.updateMany({
        where: { tenantId: { equals: undefined } as any },
        data: { tenantId },
    });

    console.log('migrating prospects...');
    await prisma.prospect.updateMany({
        where: { tenantId: { equals: undefined } as any },
        data: { tenantId },
    });

    console.log('migrating invitations...');
    await prisma.invitation.updateMany({
        where: { tenantId: { equals: undefined } as any },
        data: { tenantId },
    });

    console.log('migrating payment commitments...');
    await prisma.paymentCommitment.updateMany({
        where: { tenantId: { equals: undefined } as any },
        data: { tenantId },
    });

    console.log('migrating system configs...');
    await prisma.systemConfig.updateMany({
        where: { tenantId: { equals: undefined } as any },
        data: { tenantId },
    });

    console.log('Migration completed successfully!');
}

main()
    .catch((e) => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
