import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findUnique({
        where: { slug: "edutec" },
        include: { branding: true }
    });

    if (!tenant) {
        console.error("No se encontró el tenant 'edutec'");
        return;
    }

    const brandingData = {
        logoUrl: "/logo-edutec.png",
        darkMode: false,
        // Blue colors from logo
        primaryColor: "#2563eb", // Royal Blue
        secondaryColor: "#3b82f6", // Blue 500
        accentColor: "#60a5fa", // Blue 400
        footerText: "Instituto EDUTEC - Educamos con Valores",
        // Light background for login
        loginBgGradient: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
    };

    if (tenant.branding) {
        await prisma.tenantBranding.update({
            where: { id: tenant.branding.id },
            data: brandingData
        });
        console.log("Branding de Edutec actualizado a Modo Claro y Azul.");
    } else {
        await prisma.tenantBranding.create({
            data: {
                tenantId: tenant.id,
                ...brandingData
            }
        });
        console.log("Branding de Edutec creado en Modo Claro y Azul.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
