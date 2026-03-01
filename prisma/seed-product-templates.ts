/**
 * Seed de ProductTemplate: 3 plantillas de producto base.
 *
 * Ejecutar: npx tsx prisma/seed-product-templates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
  {
    name: 'Kaled Academy',
    slug: 'kaled-academy',
    description:
      'Plataforma educativa completa con gestión académica, estudiantes, programas y pagos. Configuración predefinida del ecosistema KaledSoft.',
    icon: 'GraduationCap',
    domain: 'kaledacademy.kaledsoft.tech',
    logoUrl: '/kaledsoft-logo-transparent.png',
    primaryColor: '#1e3a5f',
    secondaryColor: '#3b82f6',
    accentColor: '#10b981',
    darkMode: true,
    footerText: 'Kaled Academy - Ecosistema KaledSoft',
    adminName: 'Gerente Kaled Academy',
    adminEmail: 'gerente@kaledsoft.tech',
    plan: 'PROFESIONAL',
    allowPublicRegistration: true,
  },
  {
    name: 'Instituto Educativo',
    slug: 'instituto-educativo',
    description:
      'Plantilla genérica para instituciones educativas. Incluye gestión de estudiantes, programas académicos, pagos y reportes.',
    icon: 'School',
    primaryColor: '#1a365d',
    secondaryColor: '#2b6cb0',
    accentColor: '#38a169',
    darkMode: false,
    footerText: 'Sistema de Gestión Educativa',
    plan: 'BASICO',
    allowPublicRegistration: true,
  },
  {
    name: 'Personalizado',
    slug: 'personalizado',
    description:
      'Plantilla en blanco para crear un tenant con configuración personalizada desde cero.',
    icon: 'Settings',
    primaryColor: '#1e3a5f',
    secondaryColor: '#3b82f6',
    accentColor: '#10b981',
    darkMode: false,
    plan: 'BASICO',
    allowPublicRegistration: false,
  },
];

async function main() {
  console.log('🌱 Seeding ProductTemplate...\n');

  for (const template of templates) {
    const existing = await prisma.productTemplate.findUnique({
      where: { slug: template.slug },
    });

    if (existing) {
      await prisma.productTemplate.update({
        where: { slug: template.slug },
        data: template,
      });
      console.log(`  ✅ Actualizado: ${template.name} (${template.slug})`);
    } else {
      await prisma.productTemplate.create({
        data: template,
      });
      console.log(`  ✅ Creado: ${template.name} (${template.slug})`);
    }
  }

  console.log(`\n✅ ${templates.length} product templates procesados.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
