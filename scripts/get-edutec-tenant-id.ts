/**
 * Script para obtener el ID del tenant EDUTEC
 */

import { prisma } from '../src/lib/prisma';

async function getEdutecTenantId() {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: 'edutec' },
          { name: { contains: 'EDUTEC', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        domain: true,
        status: true,
        createdAt: true,
      },
    });

    if (!tenant) {
      console.log('❌ Tenant EDUTEC no encontrado en la base de datos');
      console.log('\nVerifica que existe ejecutando:');
      console.log('  npx prisma studio');
      console.log('  O revisa la tabla Tenant manualmente');
      process.exit(1);
    }

    console.log('✅ Tenant EDUTEC encontrado:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ID:        ${tenant.id}`);
    console.log(`Slug:      ${tenant.slug}`);
    console.log(`Nombre:    ${tenant.name}`);
    console.log(`Dominio:   ${tenant.domain || 'No configurado'}`);
    console.log(`Status:    ${tenant.status === 'ACTIVO' ? '✅ Activo' : '⚠️ ' + tenant.status}`);
    console.log(`Creado:    ${tenant.createdAt.toLocaleDateString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 PARA CONFIGURAR EN VERCEL:\n');
    console.log('1. Ir a: https://vercel.com/settings/environment-variables');
    console.log('2. Agregar variable:');
    console.log(`   Nombre:  DEFAULT_TENANT_ID`);
    console.log(`   Valor:   ${tenant.id}`);
    console.log('   Entornos: ✓ Production ✓ Preview ✓ Development');
    console.log('3. Guardar y esperar re-deploy automático\n');

    console.log('📝 O copiar directamente:');
    console.log(`DEFAULT_TENANT_ID=${tenant.id}\n`);

  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

getEdutecTenantId();
