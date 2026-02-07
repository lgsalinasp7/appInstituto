import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: "edutec" },
        include: { branding: true }
    });

    if (!tenant) {
        console.error("Tenant Edutec not found");
        return;
    }

    console.log("Found tenant:", tenant.name);

    if (tenant.branding) {
        await prisma.tenantBranding.update({
            where: { id: tenant.branding.id },
            data: {
                logoUrl: "/logo-edutec.png",
                darkMode: false,
                primaryColor: "#06b6d4", // Cyan 500
                secondaryColor: "#2563eb", // Blue 600
                accentColor: "#f59e0b", // Amber 500
                footerText: "Instituto EDUTEC - Educamos con Valores",
            }
        });
        console.log("Branding updated successfully");
    } else {
        await prisma.tenantBranding.create({
            data: {
                tenantId: tenant.id,
                logoUrl: "/logo-edutec.png",
                darkMode: false,
                primaryColor: "#06b6d4",
                secondaryColor: "#2563eb",
                accentColor: "#f59e0b",
                footerText: "Instituto EDUTEC - Educamos con Valores",
            }
        });
        console.log("Branding created successfully");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
