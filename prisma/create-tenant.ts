import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTenant(name: string, slug: string) {
    console.log(`Creating tenant: ${name} (${slug})...`);

    try {
        const tenant = await prisma.tenant.create({
            data: {
                name,
                slug,
            },
        });

        console.log(`Tenant created successfully!`);
        console.log(`ID: ${tenant.id}`);
        console.log(`URL: http://${slug}.localhost:3000 (Local)`);
        console.log(`URL: https://${slug}.kaledsoft.tech (Production)`);
    } catch (error: any) {
        if (error.code === 'P2002') {
            console.error(`Error: The slug "${slug}" is already in use.`);
        } else {
            console.error(`Error creating tenant:`, error);
        }
    }
}

// Example usage: npx tsx prisma/create-tenant.ts "Edutec" "edutec"
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: npx tsx prisma/create-tenant.ts "Tenant Name" "slug"');
    process.exit(1);
}

createTenant(args[0], args[1])
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
