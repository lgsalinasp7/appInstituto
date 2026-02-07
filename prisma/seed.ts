import { PrismaClient, PlatformRole } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

// Leer .env manualmente para asegurar que se cargue
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf8");
const envLines = envContent.split("\n");

let connectionString = "";
for (const line of envLines) {
    if (line.startsWith("DATABASE_URL=")) {
        connectionString = line.replace("DATABASE_URL=", "").replace(/"/g, "").trim();
        break;
    }
}

if (!connectionString) {
    throw new Error("DATABASE_URL not found in .env file");
}

console.log("DATABASE_URL found, connecting...");
process.env.DATABASE_URL = connectionString;

const prisma = new PrismaClient();

async function main() {
    console.log("=== SEED MULTI-TENANT ===");
    console.log("Reiniciando base de datos...");

    // Limpiar tablas en orden inverso de dependencias
    await prisma.receipt.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.paymentCommitment.deleteMany();
    await prisma.contentDelivery.deleteMany();
    await prisma.academicContent.deleteMany();
    await prisma.prospect.deleteMany();
    await prisma.student.deleteMany();
    await prisma.program.deleteMany();
    await prisma.session.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.tenantBranding.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.systemConfig.deleteMany();
    await prisma.tenant.deleteMany();

    // ============================================
    // PASO 1: Crear Tenant de ejemplo
    // ============================================
    console.log("Creando tenant EDUTEC...");
    const tenant = await prisma.tenant.create({
        data: {
            name: "Instituto EDUTEC",
            slug: "edutec",
            status: "ACTIVO",
            plan: "PROFESIONAL",
            email: "admin@edutec.edu.co",
        },
    });

    // Crear branding del tenant
    await prisma.tenantBranding.create({
        data: {
            tenantId: tenant.id,
            primaryColor: "#1e3a5f",
            secondaryColor: "#3b82f6",
            accentColor: "#10b981",
            fontFamily: "Inter",
            footerText: "Instituto EDUTEC - Educamos con Valores",
        },
    });

    // ============================================
    // PASO 2: Crear Roles del Tenant
    // ============================================
    console.log("Creando roles del tenant...");
    const superAdminRole = await prisma.role.create({
        data: {
            name: "SUPERADMIN",
            description: "Super Administrador del Tenant",
            permissions: ["all"],
            tenantId: tenant.id,
        },
    });
    const adminRole = await prisma.role.create({
        data: {
            name: "ADMINISTRADOR",
            description: "Administrador del sistema",
            permissions: ["all"],
            tenantId: tenant.id,
        },
    });
    const ventasRole = await prisma.role.create({
        data: {
            name: "VENTAS",
            description: "Ventas y Matriculas",
            permissions: ["dashboard", "matriculas"],
            tenantId: tenant.id,
        },
    });
    const carteraRole = await prisma.role.create({
        data: {
            name: "CARTERA",
            description: "Cartera y Recaudos",
            permissions: ["dashboard", "recaudos"],
            tenantId: tenant.id,
        },
    });

    // ============================================
    // PASO 3: Crear Usuario SuperAdmin de PLATAFORMA
    // ============================================
    console.log("Creando SuperAdmin de Plataforma (KaledSoft)...");
    const platformPassword = await bcrypt.hash("Admin123!", SALT_ROUNDS);
    const platformSuperAdmin = await prisma.user.create({
        data: {
            name: "Luis Salinas",
            email: "superadmin@kaledsoft.tech",
            password: platformPassword,
            isActive: true,
            platformRole: PlatformRole.SUPER_ADMIN,
            tenantId: null,  // Sin tenant = usuario de plataforma
            roleId: null,    // Sin rol de tenant
        },
    });
    console.log(`  -> SuperAdmin Plataforma: superadmin@kaledsoft.tech / Admin123!`);

    // ============================================
    // PASO 4: Crear Usuarios del Tenant
    // ============================================
    console.log("Creando usuarios del tenant EDUTEC...");

    // SuperAdmin del tenant
    const tenantSuperAdminPassword = await bcrypt.hash("Admin123!", SALT_ROUNDS);
    await prisma.user.create({
        data: {
            name: "Luis Salinas (Tenant)",
            email: "superadmin@edutec.edu.co",
            roleId: superAdminRole.id,
            tenantId: tenant.id,
            isActive: true,
            password: tenantSuperAdminPassword,
        },
    });
    console.log(`  -> SuperAdmin Tenant: superadmin@edutec.edu.co / Admin123!`);

    // Admin del tenant
    const adminPassword = await bcrypt.hash("Admin123!", SALT_ROUNDS);
    await prisma.user.create({
        data: {
            name: "Administrador EDUTEC",
            email: "admin@edutec.edu.co",
            roleId: adminRole.id,
            tenantId: tenant.id,
            isActive: true,
            invitationLimit: 9,
            password: adminPassword,
        },
    });
    console.log(`  -> Admin Tenant: admin@edutec.edu.co / Admin123!`);

    // Asesores
    const advisorList = [
        { name: "Asesor Comercial 1", email: "asesor1@edutec.edu.co" },
        { name: "Asesor Comercial 2", email: "asesor2@edutec.edu.co" },
        { name: "Asesor Comercial 3", email: "asesor3@edutec.edu.co" },
        { name: "Maria Gonzalez", email: "maria.gonzalez@edutec.edu.co" },
        { name: "Carlos Rodriguez", email: "carlos.rodriguez@edutec.edu.co" },
    ];

    const collectionList = [
        { name: "Gestor Recaudos 1", email: "recaudos1@edutec.edu.co" },
        { name: "Gestor Recaudos 2", email: "recaudos2@edutec.edu.co" },
    ];

    const advisorPassword = await bcrypt.hash("Asesor123!", SALT_ROUNDS);
    const collectionPassword = await bcrypt.hash("Recaudos123!", SALT_ROUNDS);

    const createdAdvisors = [];
    for (const adv of advisorList) {
        const user = await prisma.user.create({
            data: {
                name: adv.name,
                email: adv.email,
                roleId: ventasRole.id,
                tenantId: tenant.id,
                isActive: true,
                password: advisorPassword,
            },
        });
        createdAdvisors.push(user);
    }
    console.log(`  -> ${advisorList.length} asesores creados (password: Asesor123!)`);

    for (const coll of collectionList) {
        await prisma.user.create({
            data: {
                name: coll.name,
                email: coll.email,
                roleId: carteraRole.id,
                tenantId: tenant.id,
                isActive: true,
                password: collectionPassword,
            },
        });
    }
    console.log(`  -> ${collectionList.length} gestores de recaudos creados (password: Recaudos123!)`);

    // ============================================
    // PASO 5: Crear Programas del Tenant
    // ============================================
    console.log("Creando programas...");
    const programsData = [
        { name: "Tecnico en Enfermeria", totalValue: 3500000, matriculaValue: 60000, modulesCount: 6 },
        { name: "Auxiliar en Salud Oral", totalValue: 2800000, matriculaValue: 60000, modulesCount: 6 },
        { name: "Tecnico en Farmacia", totalValue: 3200000, matriculaValue: 60000, modulesCount: 6 },
        { name: "Auxiliar Administrativo en Salud", totalValue: 2500000, matriculaValue: 50000, modulesCount: 6 },
        { name: "Tecnico en Atencion a la Primera Infancia", totalValue: 2900000, matriculaValue: 60000, modulesCount: 6 },
    ];

    const createdPrograms = [];
    for (const prog of programsData) {
        const program = await prisma.program.create({
            data: {
                name: prog.name,
                totalValue: prog.totalValue,
                matriculaValue: prog.matriculaValue,
                modulesCount: prog.modulesCount,
                isActive: true,
                tenantId: tenant.id,
            },
        });
        createdPrograms.push(program);
    }
    console.log(`  -> ${programsData.length} programas creados`);

    // ============================================
    // PASO 6: Configuracion del sistema
    // ============================================
    console.log("Creando configuracion del sistema...");
    await prisma.systemConfig.create({
        data: {
            key: "MONTHLY_GOAL",
            value: "50000000",
            tenantId: tenant.id,
        },
    });

    // ============================================
    // PASO 7: Crear Estudiantes con Pagos
    // ============================================
    console.log("Creando estudiantes y pagos...");
    const studentsRaw = [
        { name: "Laura Sofia Perez Gomez", document: "1098765432", phone: "3023315972", email: "laura.perez@email.com", programIdx: 0, advisorIdx: 0, enrollmentDate: "2024-11-15", commitmentDateOffset: 0 },
        { name: "Juan David Lopez Torres", document: "1087654321", phone: "3023315972", email: "juan.lopez@email.com", programIdx: 1, advisorIdx: 1, enrollmentDate: "2025-01-01", commitmentDateOffset: 3 },
        { name: "Valentina Ramirez Diaz", document: "1076543210", phone: "3023315972", email: "valentina.ramirez@email.com", programIdx: 2, advisorIdx: 2, enrollmentDate: "2025-01-10", commitmentDateOffset: 15 },
        { name: "Camila Andrea Garcia Ruiz", document: "1054321098", phone: "3045678901", email: "camila.garcia@email.com", programIdx: 4, advisorIdx: 0, enrollmentDate: "2024-12-25", commitmentDateOffset: 45 },
        { name: "Andres Felipe Castro", document: "1022334455", phone: "3112223344", email: "andres.castro@email.com", programIdx: 3, advisorIdx: 3, enrollmentDate: "2025-01-05", commitmentDateOffset: 5 },
        { name: "Diana Marcela Ortiz", document: "1055667788", phone: "3154445566", email: "diana.ortiz@email.com", programIdx: 0, advisorIdx: 4, enrollmentDate: "2025-01-12", commitmentDateOffset: -2 },
    ];

    for (const std of studentsRaw) {
        const program = createdPrograms[std.programIdx];
        const advisor = createdAdvisors[std.advisorIdx];
        const valorModulo = (Number(program.totalValue) - Number(program.matriculaValue)) / program.modulesCount;

        const student = await prisma.student.create({
            data: {
                fullName: std.name,
                documentNumber: std.document,
                phone: std.phone,
                email: std.email,
                enrollmentDate: new Date(std.enrollmentDate),
                programId: program.id,
                advisorId: advisor.id,
                tenantId: tenant.id,
                totalProgramValue: program.totalValue,
                initialPayment: program.matriculaValue,
                status: "MATRICULADO",
                matriculaPaid: true,
                currentModule: 1,
            },
        });

        await prisma.payment.create({
            data: {
                amount: program.matriculaValue,
                paymentDate: new Date(std.enrollmentDate),
                method: "EFECTIVO",
                receiptNumber: `REC-MAT-${std.document}`,
                paymentType: "MATRICULA",
                studentId: student.id,
                registeredById: advisor.id,
                tenantId: tenant.id,
            },
        });

        const today = new Date();
        for (let i = 1; i <= program.modulesCount; i++) {
            const scheduledDate = new Date(today);
            scheduledDate.setDate(today.getDate() + (std.commitmentDateOffset + (i - 1) * 30));

            await prisma.paymentCommitment.create({
                data: {
                    scheduledDate: scheduledDate,
                    amount: valorModulo,
                    status: "PENDIENTE",
                    moduleNumber: i,
                    studentId: student.id,
                    tenantId: tenant.id,
                },
            });
        }
    }
    console.log(`  -> ${studentsRaw.length} estudiantes creados con pagos y compromisos`);

    // ============================================
    // PASO 8: Crear Prospectos
    // ============================================
    console.log("Creando prospectos...");
    const prospectsRaw = [
        { name: "Carolina Mendoza Arias", phone: "3023315972", status: "CONTACTADO" as const, programIdx: 0, advisorIdx: 0 },
        { name: "Pedro Jose Ramirez Luna", phone: "3023315972", status: "EN_SEGUIMIENTO" as const, programIdx: 1, advisorIdx: 1 },
        { name: "Ana Maria Quintero Velez", phone: "3023315972", status: "EN_SEGUIMIENTO" as const, programIdx: 2, advisorIdx: 2 },
        { name: "Jorge Ivan Restrepo", phone: "3201112233", status: "CONTACTADO" as const, programIdx: 3, advisorIdx: 3 },
        { name: "Martha Lucia Santos", phone: "3189998877", status: "CONTACTADO" as const, programIdx: 4, advisorIdx: 4 },
        { name: "Roberto Gomez", phone: "3005556677", status: "EN_SEGUIMIENTO" as const, programIdx: 0, advisorIdx: 0 },
    ];

    for (const pros of prospectsRaw) {
        await prisma.prospect.create({
            data: {
                name: pros.name,
                phone: pros.phone,
                status: pros.status,
                programId: createdPrograms[pros.programIdx].id,
                advisorId: createdAdvisors[pros.advisorIdx].id,
                tenantId: tenant.id,
            },
        });
    }
    console.log(`  -> ${prospectsRaw.length} prospectos creados`);

    // ============================================
    // RESUMEN
    // ============================================
    console.log("\n=== SEED COMPLETADO ===");
    console.log("\n--- CREDENCIALES ---");
    console.log("PLATAFORMA (admin.kaledsoft.tech):");
    console.log("  SuperAdmin: superadmin@kaledsoft.tech / Admin123!");
    console.log("");
    console.log("TENANT EDUTEC (edutec.kaledsoft.tech):");
    console.log("  SuperAdmin: superadmin@edutec.edu.co / Admin123!");
    console.log("  Admin:      admin@edutec.edu.co / Admin123!");
    console.log("  Asesores:   asesor1@edutec.edu.co / Asesor123!");
    console.log("  Recaudos:   recaudos1@edutec.edu.co / Recaudos123!");
    console.log("-------------------\n");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
