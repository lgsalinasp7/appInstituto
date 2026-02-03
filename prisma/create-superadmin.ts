/**
 * Script para crear usuario SUPERADMIN
 *
 * Uso: npx tsx prisma/create-superadmin.ts
 *
 * Este script crea:
 * 1. Rol SUPERADMIN (si no existe)
 * 2. Usuario superadmin@kaledsoft.tech con acceso global
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Creando usuario SUPERADMIN...\n');

    // 1. Crear o encontrar tenant de sistema (para usuarios globales)
    let systemTenant = await prisma.tenant.findFirst({
        where: { slug: 'system' }
    });

    if (!systemTenant) {
        systemTenant = await prisma.tenant.create({
            data: {
                name: 'Sistema Global',
                slug: 'system',
            }
        });
        console.log('✅ Tenant de sistema creado');
    } else {
        console.log('ℹ️  Tenant de sistema ya existe');
    }

    // 2. Crear o encontrar rol SUPERADMIN
    let superadminRole = await prisma.role.findFirst({
        where: { name: 'SUPERADMIN' }
    });

    if (!superadminRole) {
        superadminRole = await prisma.role.create({
            data: {
                name: 'SUPERADMIN',
                description: 'Super administrador del sistema - Acceso global',
                permissions: ['*'],
                tenant: {
                    connect: { id: systemTenant.id }
                }
            }
        });
        console.log('✅ Rol SUPERADMIN creado');
    } else {
        console.log('ℹ️  Rol SUPERADMIN ya existe');
    }

    // 2. Crear usuario SUPERADMIN
    const email = 'superadmin@kaledsoft.tech';
    const password = 'Admin123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        // Actualizar rol si el usuario ya existe
        await prisma.user.update({
            where: { email },
            data: {
                role: {
                    connect: { id: superadminRole.id }
                },
                tenant: {
                    connect: { id: systemTenant.id }
                },
                isActive: true,
            }
        });
        console.log('ℹ️  Usuario ya existe, rol actualizado a SUPERADMIN');
    } else {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Super Administrador',
                role: {
                    connect: { id: superadminRole.id }
                },
                tenant: {
                    connect: { id: systemTenant.id }
                },
                isActive: true,
            }
        });
        console.log('✅ Usuario SUPERADMIN creado');
    }

    console.log('\n════════════════════════════════════════');
    console.log('  CREDENCIALES DE ACCESO');
    console.log('════════════════════════════════════════');
    console.log(`  📧 Email:    ${email}`);
    console.log(`  🔑 Password: ${password}`);
    console.log('════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login\n');
    console.log('📍 Acceder a:');
    console.log('   - Local:      http://localhost:3000/auth/login');
    console.log('   - Producción: https://kaledsoft.tech/auth/login');
    console.log('\n📍 Panel de Empresas:');
    console.log('   - Local:      http://localhost:3000/admin/empresas');
    console.log('   - Producción: https://kaledsoft.tech/admin/empresas');
}

main()
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
