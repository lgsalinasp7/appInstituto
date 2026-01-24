import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import * as fs from "fs";
import * as path from "path";

// Leer .env manualmente para asegurar que se cargue
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf8");
const envLines = envContent.split("\n");

let connectionString = "";
for (const line of envLines) {
    if (line.startsWith("DATABASE_URL=")) {
        // Remover DATABASE_URL= y las comillas
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
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.systemConfig.deleteMany();

    console.log("Creando roles...");
    const adminRole = await prisma.role.create({
        data: { name: "admin", description: "Administrador del sistema", permissions: ["all"] }
    });
    const advisorRole = await prisma.role.create({
        data: { name: "asesor", description: "Asesor educativo", permissions: ["read", "write"] }
    });

    console.log("Creando usuario administrador...");
    await prisma.user.create({
        data: {
            name: "Administrador",
            email: "admin@instituto.edu.co",
            roleId: adminRole.id,
            isActive: true,
        }
    });

    console.log("Creando usuarios (asesores)...");
    const advisors = [
        { name: "María González", email: "maria.gonzalez@instituto.edu.co" },
        { name: "Carlos Rodríguez", email: "carlos.rodriguez@instituto.edu.co" },
        { name: "Ana Martínez", email: "ana.martinez@instituto.edu.co" },
        { name: "Luis Hernández", email: "luis.hernandez@instituto.edu.co" },
    ];

    const createdAdvisors = [];
    for (const adv of advisors) {
        const user = await prisma.user.create({
            data: {
                name: adv.name,
                email: adv.email,
                roleId: advisorRole.id,
                isActive: true,
            }
        });
        createdAdvisors.push(user);
    }

    console.log("Creando programas...");
    const programsData = [
        { name: "Técnico en Enfermería", totalValue: 3500000, matriculaValue: 60000, modulesCount: 6 },
        { name: "Auxiliar en Salud Oral", totalValue: 2800000, matriculaValue: 60000, modulesCount: 6 },
        { name: "Técnico en Farmacia", totalValue: 3200000, matriculaValue: 60000, modulesCount: 6 },
        { name: "Auxiliar Administrativo en Salud", totalValue: 2500000, matriculaValue: 50000, modulesCount: 6 },
        { name: "Técnico en Atención a la Primera Infancia", totalValue: 2900000, matriculaValue: 60000, modulesCount: 6 },
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
            }
        });
        createdPrograms.push(program);
    }

    console.log("Creando configuración del sistema...");
    await prisma.systemConfig.create({
        data: { key: "MONTHLY_GOAL", value: "50000000" }
    });

    console.log("Creando estudiantes y pagos...");
    const studentsRaw = [
        { name: "Laura Sofía Pérez Gómez", document: "1098765432", phone: "3023315972", email: "laura.perez@email.com", programIdx: 0, advisorIdx: 0, enrollmentDate: "2024-08-15", commitmentDateOffset: 0 }, // Hoy
        { name: "Juan David López Torres", document: "1087654321", phone: "3023315972", email: "juan.lopez@email.com", programIdx: 1, advisorIdx: 1, enrollmentDate: "2024-09-01", commitmentDateOffset: 3 }, // Esta semana
        { name: "Valentina Ramírez Díaz", document: "1076543210", phone: "3023315972", email: "valentina.ramirez@email.com", programIdx: 2, advisorIdx: 2, enrollmentDate: "2024-10-10", commitmentDateOffset: 15 }, // Este mes
        { name: "Camila Andrea García Ruiz", document: "1054321098", phone: "3045678901", email: "camila.garcia@email.com", programIdx: 4, advisorIdx: 0, enrollmentDate: "2024-08-25", commitmentDateOffset: 45 }, // Futuro
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
                totalProgramValue: program.totalValue,
                initialPayment: program.matriculaValue,
                status: "MATRICULADO",
                matriculaPaid: true,
                currentModule: 1,
            }
        });

        // Crear un pago de matrícula
        await prisma.payment.create({
            data: {
                amount: program.matriculaValue,
                paymentDate: new Date(std.enrollmentDate),
                method: "EFECTIVO",
                receiptNumber: `REC-MAT-${std.document}`,
                paymentType: "MATRICULA",
                studentId: student.id,
                registeredById: advisor.id,
            }
        });

        // Crear compromisos
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
                }
            });
        }
    }

    console.log("Creando prospectos...");
    const prospectsRaw = [
        { name: "Carolina Mendoza Arias", phone: "3023315972", status: "CONTACTADO" as const, programIdx: 0, advisorIdx: 0 },
        { name: "Pedro José Ramírez Luna", phone: "3023315972", status: "EN_SEGUIMIENTO" as const, programIdx: 1, advisorIdx: 1 },
        { name: "Ana María Quintero Vélez", phone: "3023315972", status: "EN_SEGUIMIENTO" as const, programIdx: 2, advisorIdx: 2 },
    ];

    for (const pros of prospectsRaw) {
        await prisma.prospect.create({
            data: {
                name: pros.name,
                phone: pros.phone,
                status: pros.status,
                programId: createdPrograms[pros.programIdx].id,
                advisorId: createdAdvisors[pros.advisorIdx].id,
            }
        });
    }

    console.log("Seed completado exitosamente! 🚀");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
