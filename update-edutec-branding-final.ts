import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: "edutec" },
        include: { branding: true }
    });

    if (!tenant) {
        console.error("No se encontró el tenant 'edutec'");
        process.exit(1);
    }

    console.log("Tenant encontrado:", tenant.name, "(ID:", tenant.id, ")");

    const brandingData = {
        logoUrl: "/logo-edutec.png",
        darkMode: false,
        primaryColor: "#06b6d4", // Cian 500
        secondaryColor: "#2563eb", // Blue 600
        accentColor: "#f59e0b", // Amber 500
        footerText: "Instituto EDUTEC - Educamos con Valores",
        loginBgGradient: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", // Light gradient
    };

    if (tenant.branding) {
        await prisma.tenantBranding.update({
            where: { id: tenant.branding.id },
            data: brandingData
        });
        console.log("Branding actualizado correctamente.");
    } else {
        await prisma.tenantBranding.create({
            data: {
                tenantId: tenant.id,
                ...brandingData
            }
        });
        console.log("Branding creado correctamente.");
    }
}

main()
    .catch((err) => {
        console.error("Error al ejecutar el script:", err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
