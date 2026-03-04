/**
 * Seed: Curso "Stack Tecnológico Profesional" para Kaled Academy
 *
 * Crea el curso completo con 6 módulos y lecciones según la estructura definida.
 * Requiere: tenant kaledacademy existente y al menos un usuario admin.
 *
 * Uso: npx tsx prisma/seed-academy-stack.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COURSE_TITLE = "Stack Tecnológico Profesional";

const COURSE_DESCRIPTION = `Trabajamos con herramientas modernas utilizadas en productos reales:

🖥 Frontend: Next.js (App Router), React, TypeScript, TailwindCSS, Shadcn/UI

⚙ Backend: API Routes con Node.js, Prisma ORM, PostgreSQL

🔐 Autenticación: NextAuth / Auth.js

🤖 Inteligencia Artificial: API OpenAI, Prompt Engineering aplicado a producto

💳 Monetización LATAM: Mercado Pago, Wompi

☁ Producción: Deploy en Vercel, Base de datos en producción, Variables de entorno

No usamos tecnologías obsoletas. No trabajamos con ejemplos irreales.
Construyes como se construye en el mundo real.`;

const COURSE_DESCRIPTION2 = `🚀 Esto no es un bootcamp tradicional. Es una incubadora práctica de SaaS con IA.

Al finalizar tendrás: Un SaaS completo construido por ti, IA integrada correctamente, Pagos configurados para LATAM, Deploy en producción, Arquitectura explicable, Mentalidad de fundador tecnológico.

Y lo más importante: No dependerás de la IA. La usarás estratégicamente.`;

const MODULES: Array<{
  title: string;
  description: string;
  lessons: Array<{ title: string; description: string; content: string; duration: number }>;
}> = [
  {
    title: "Mentalidad de Arquitecto Digital",
    description:
      "Aprende a pensar antes de programar. Entiendes cómo funciona realmente un sistema. Diseñas antes de escribir código. Aprendes a usar la IA sin depender de ella.",
    lessons: [
      {
        title: "Cómo funciona realmente un sistema",
        description: "Fundamentos de arquitectura de software",
        content: "<p>Contenido pendiente: entender cómo se conectan los componentes de un sistema real.</p>",
        duration: 45,
      },
      {
        title: "Diseñar antes de escribir código",
        description: "Planificación y modelado",
        content: "<p>Contenido pendiente: técnicas de diseño antes de implementar.</p>",
        duration: 60,
      },
      {
        title: "Usar la IA sin depender de ella",
        description: "Mentalidad crítica con herramientas de IA",
        content: "<p>Contenido pendiente: cuándo y cómo usar IA para acelerar sin perder comprensión.</p>",
        duration: 45,
      },
    ],
  },
  {
    title: "Frontend Profesional con Next.js",
    description:
      "Interfaces modernas que escalan. Construyes una base sólida en React + Next.js. No haces páginas. Construyes componentes reutilizables y arquitectura escalable.",
    lessons: [
      {
        title: "React + Next.js: base sólida",
        description: "Fundamentos del stack moderno",
        content: "<p>Contenido pendiente: App Router, Server Components, routing.</p>",
        duration: 90,
      },
      {
        title: "Componentes reutilizables",
        description: "Arquitectura de componentes",
        content: "<p>Contenido pendiente: diseño de componentes, composición, props.</p>",
        duration: 75,
      },
      {
        title: "Arquitectura escalable",
        description: "Estructura de carpetas y patrones",
        content: "<p>Contenido pendiente: organización de carpetas, convenciones, escalabilidad.</p>",
        duration: 60,
      },
    ],
  },
  {
    title: "Backend y Base de Datos Real",
    description:
      "Aquí nace el verdadero SaaS. Diseñas y construyes: modelado de datos profesional, CRUD completo, autenticación multiusuario, control de acceso.",
    lessons: [
      {
        title: "Modelado de datos profesional",
        description: "Prisma y diseño de esquema",
        content: "<p>Contenido pendiente: Prisma schema, relaciones, migraciones.</p>",
        duration: 90,
      },
      {
        title: "CRUD completo",
        description: "API Routes con Node.js",
        content: "<p>Contenido pendiente: endpoints REST, validación, errores.</p>",
        duration: 75,
      },
      {
        title: "Autenticación multiusuario",
        description: "NextAuth / Auth.js",
        content: "<p>Contenido pendiente: sesiones, providers, roles.</p>",
        duration: 90,
      },
      {
        title: "Control de acceso",
        description: "Autorización y permisos",
        content: "<p>Contenido pendiente: middleware, RBAC, tenant isolation.</p>",
        duration: 60,
      },
    ],
  },
  {
    title: "AI SaaS Engineering",
    description:
      "Integra IA dentro de tu producto. Prompt Engineering estratégico, integración con API OpenAI, arquitectura IA backend, control de uso por usuario.",
    lessons: [
      {
        title: "Prompt Engineering estratégico",
        description: "Diseño de prompts efectivos",
        content: "<p>Contenido pendiente: técnicas de prompting, few-shot, chain-of-thought.</p>",
        duration: 75,
      },
      {
        title: "Integración con API OpenAI",
        description: "Conectar tu producto a OpenAI",
        content: "<p>Contenido pendiente: API keys, streaming, manejo de errores.</p>",
        duration: 90,
      },
      {
        title: "Arquitectura IA backend",
        description: "Patrones para features con IA",
        content: "<p>Contenido pendiente: servicios, rutas, abstracción.</p>",
        duration: 75,
      },
      {
        title: "Control de uso por usuario",
        description: "Límites y quotas",
        content: "<p>Contenido pendiente: tracking de tokens, límites por plan.</p>",
        duration: 45,
      },
    ],
  },
  {
    title: "Monetización Real para LATAM",
    description:
      "Si no puedes cobrar, no es un SaaS. Integramos pagos reales: Mercado Pago, Wompi. Flujo de pago, webhooks, control por suscripción, restricción por plan.",
    lessons: [
      {
        title: "Mercado Pago y Wompi",
        description: "Integración de pasarelas LATAM",
        content: "<p>Contenido pendiente: configuración, SDKs, ambientes.</p>",
        duration: 90,
      },
      {
        title: "Flujo de pago completo",
        description: "Checkout y confirmación",
        content: "<p>Contenido pendiente: flujo de checkout, redirects, estados.</p>",
        duration: 75,
      },
      {
        title: "Webhooks y control",
        description: "Eventos y sincronización",
        content: "<p>Contenido pendiente: webhooks, idempotencia, retries.</p>",
        duration: 60,
      },
      {
        title: "Restricción por plan",
        description: "Planes y límites",
        content: "<p>Contenido pendiente: suscripciones, planes, feature flags.</p>",
        duration: 45,
      },
    ],
  },
  {
    title: "Deploy y Escalabilidad",
    description:
      "Lanza como producto real. Tu SaaS termina en producción con base de datos real, autenticación, IA integrada y pagos funcionando. No es un proyecto local. Es un activo digital.",
    lessons: [
      {
        title: "Deploy en Vercel",
        description: "Producción en Vercel",
        content: "<p>Contenido pendiente: build, env vars, dominios.</p>",
        duration: 75,
      },
      {
        title: "Base de datos en producción",
        description: "PostgreSQL en producción",
        content: "<p>Contenido pendiente: Vercel Postgres, Neon, Supabase.</p>",
        duration: 60,
      },
      {
        title: "Variables de entorno",
        description: "Configuración segura",
        content: "<p>Contenido pendiente: secrets, diferentes ambientes.</p>",
        duration: 45,
      },
      {
        title: "Checklist de lanzamiento",
        description: "Todo listo para producción",
        content: "<p>Contenido pendiente: checklist final, monitoreo, errores.</p>",
        duration: 45,
      },
    ],
  },
];

async function main() {
  console.log("=== SEED: Stack Tecnológico Profesional ===\n");

  const tenant = await prisma.tenant.findUnique({
    where: { slug: "kaledacademy" },
  });

  if (!tenant) {
    console.error("Tenant kaledacademy no existe. Ejecuta primero el deploy de Kaled Academy desde Productos.");
    process.exit(1);
  }

  const creator = await prisma.user.findFirst({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "asc" },
  });

  if (!creator) {
    console.error("No hay usuarios en kaledacademy. Asigna al menos un admin antes de ejecutar este seed.");
    process.exit(1);
  }

  const existing = await prisma.academyCourse.findFirst({
    where: { tenantId: tenant.id, title: COURSE_TITLE },
  });

  if (existing) {
    console.log(`El curso "${COURSE_TITLE}" ya existe (id: ${existing.id}).`);
    console.log("Para recrearlo, elimínalo primero desde Admin > Cursos.");
    process.exit(0);
  }

  const course = await prisma.academyCourse.create({
    data: {
      title: COURSE_TITLE,
      description: COURSE_DESCRIPTION,
      description2: COURSE_DESCRIPTION2,
      category: "Desarrollo Full Stack",
      duration: "16 semanas",
      level: "PROFESIONAL",
      price: 0,
      durationWeeks: 16,
      isActive: true,
      tenantId: tenant.id,
      createdById: creator.id,
    },
  });

  console.log(`Curso creado: ${course.id}`);

  for (let m = 0; m < MODULES.length; m++) {
    const mod = MODULES[m];
    const moduleRecord = await prisma.academyModule.create({
      data: {
        title: mod.title,
        description: mod.description,
        order: m + 1,
        isActive: true,
        courseId: course.id,
      },
    });

    for (let l = 0; l < mod.lessons.length; l++) {
      const lesson = mod.lessons[l];
      await prisma.academyLesson.create({
        data: {
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          duration: lesson.duration,
          order: l + 1,
          isActive: true,
          moduleId: moduleRecord.id,
        },
      });
    }
    console.log(`  Módulo ${m + 1}: ${mod.title} (${mod.lessons.length} lecciones)`);
  }

  const totalLessons = MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  console.log(`\n=== COMPLETADO ===`);
  console.log(`Curso: ${COURSE_TITLE}`);
  console.log(`Módulos: ${MODULES.length}`);
  console.log(`Lecciones: ${totalLessons}`);
  console.log(`\nPuedes ver el curso en: /academia/admin/courses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
