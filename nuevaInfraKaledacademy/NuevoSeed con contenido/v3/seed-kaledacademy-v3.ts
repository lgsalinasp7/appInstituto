// ============================================================
// SEED V3 — KaledAcademy
// Versión: 3.0 — Contenido pedagógico real y progresivo
// 4 Módulos · 16 Semanas · 48 Sesiones · 144 Horas
//
// REGLA DE ORO: ninguna sesión menciona un concepto que no
// haya sido explicado en una sesión anterior.
//
// Módulo 1: HTML, CSS, JS, Git — sin mencionar React ni Next.js
// Módulo 2: React, Vite — sin mencionar Prisma ni bases de datos
// Módulo 3: Node, APIs, BD — sin mencionar pagos ni IA
// Módulo 4: IA, pagos, lanzamiento — todo lo anterior disponible
//
// Ejecutar: npx tsx prisma/seed-kaledacademy-v3.ts
// ============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Helper principal para crear una sesión completa ─────────
async function crearSesion(
  prisma: PrismaClient,
  moduleId: string,
  tenantId: string,
  s: {
    orden: number;
    semana: number;
    dia: "LUNES" | "MIERCOLES" | "VIERNES";
    titulo: string;
    descripcion: string;
    sessionType: "TEORIA" | "PRACTICA" | "ENTREGABLE" | "LIVE";
    duracion: number;
    video?: { url: string; titulo: string };
    historia: string;
    kaledIntro: string;
    analogia: string;
    conceptos: Array<{
      key: string;
      titulo: string;
      historia?: string;
      cuerpo: string;
    }>;
    cral: Array<{
      phase: "CONSTRUIR" | "ROMPER" | "AUDITAR" | "LANZAR";
      titulo: string;
      descripcion: string;
    }>;
    quiz: {
      pregunta: string;
      opciones: Array<{
        label: string;
        texto: string;
        esCorrecta: boolean;
        feedback: string;
      }>;
    };
    entregable?: {
      titulo: string;
      descripcion: string;
      esFinal: boolean;
      items: string[];
    };
  }
) {
  const lesson = await prisma.academyLesson.create({
    data: {
      title: s.titulo,
      description: s.descripcion,
      content: s.historia,
      videoUrl: s.video?.url,
      duration: s.duracion,
      order: s.orden,
      isActive: true,
      moduleId,
    },
  });

  await prisma.academyLessonMeta.create({
    data: {
      lessonId: lesson.id,
      sessionType: s.sessionType as any,
      weekNumber: s.semana,
      dayOfWeek: s.dia as any,
      videoUrl: s.video?.url,
      videoTitle: s.video?.titulo,
      kaledIntro: s.kaledIntro,
      analogyText: s.analogia,
      concepts: s.conceptos as any,
      tenantId,
    },
  });

  for (let i = 0; i < s.cral.length; i++) {
    await prisma.academyCRALChallenge.create({
      data: {
        lessonId: lesson.id,
        phase: s.cral[i].phase as any,
        title: s.cral[i].titulo,
        description: s.cral[i].descripcion,
        order: i,
        tenantId,
      },
    });
  }

  const quiz = await prisma.academyQuiz.create({
    data: {
      lessonId: lesson.id,
      question: s.quiz.pregunta,
      order: 0,
      tenantId,
    },
  });

  for (const op of s.quiz.opciones) {
    await prisma.academyQuizOption.create({
      data: {
        quizId: quiz.id,
        label: op.label,
        text: op.texto,
        isCorrect: op.esCorrecta,
        feedback: op.feedback,
      },
    });
  }

  if (s.entregable) {
    const entr = await prisma.academyDeliverable.create({
      data: {
        lessonId: lesson.id,
        weekNumber: s.semana,
        title: s.entregable.titulo,
        description: s.entregable.descripcion,
        isFinal: s.entregable.esFinal,
        tenantId,
      },
    });
    for (let i = 0; i < s.entregable.items.length; i++) {
      await prisma.academyDeliverableItem.create({
        data: { deliverableId: entr.id, text: s.entregable.items[i], order: i },
      });
    }
  }

  return lesson;
}

// ── MAIN ────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Iniciando seed V3 — contenido pedagógico real...\n");

  // ── Tenant ───────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "kaledacademy" },
    create: {
      name: "KaledAcademy", slug: "kaledacademy",
      domain: "academy.kaledsoft.tech", email: "academia@kaledsoft.tech",
      plan: "PRO", status: "ACTIVO",
      branding: {
        create: {
          primaryColor: "#161A22", secondaryColor: "#3B82F6",
          accentColor: "#10B981", fontFamily: "Inter", darkMode: true,
          footerText: "KaledSoft Technologies · Montería, Colombia",
        },
      },
    },
    update: { status: "ACTIVO" },
  });

  // ── Roles ────────────────────────────────────────────────
  const roleAdmin = await prisma.role.upsert({
    where: { name_tenantId: { name: "ACADEMY_ADMIN", tenantId: tenant.id } },
    create: { name: "ACADEMY_ADMIN", description: "Administrador", permissions: ["*"], tenantId: tenant.id },
    update: {},
  });
  const roleTeacher = await prisma.role.upsert({
    where: { name_tenantId: { name: "ACADEMY_TEACHER", tenantId: tenant.id } },
    create: { name: "ACADEMY_TEACHER", description: "Instructor", permissions: ["courses:read", "lessons:write", "deliverables:review"], tenantId: tenant.id },
    update: {},
  });
  const roleStudent = await prisma.role.upsert({
    where: { name_tenantId: { name: "ACADEMY_STUDENT", tenantId: tenant.id } },
    create: { name: "ACADEMY_STUDENT", description: "Estudiante", permissions: ["courses:read", "lessons:read", "quizzes:write", "deliverables:submit"], tenantId: tenant.id },
    update: {},
  });

  // ── Usuarios ─────────────────────────────────────────────
  const pw = await bcrypt.hash("KaledSoft2025!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "luisg@kaledsoft.tech" },
    create: { email: "luisg@kaledsoft.tech", name: "Luis Guillermo Salinas", password: pw, isActive: true, platformRole: "ACADEMY_ADMIN", tenantId: tenant.id, roleId: roleAdmin.id },
    update: {},
  });
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@kaledsoft.tech" },
    create: { email: "instructor@kaledsoft.tech", name: "Luis Salinas", password: pw, isActive: true, platformRole: "ACADEMY_TEACHER", tenantId: tenant.id, roleId: roleTeacher.id },
    update: {},
  });
  const estudiantes = await Promise.all([
    { email: "andres@demo.kaledsoft.tech", name: "Andrés Martínez" },
    { email: "valentina@demo.kaledsoft.tech", name: "Valentina Ríos" },
    { email: "carlos@demo.kaledsoft.tech", name: "Carlos Herrera" },
    { email: "juliana@demo.kaledsoft.tech", name: "Juliana Pérez" },
  ].map(s => prisma.user.upsert({
    where: { email: s.email },
    create: { ...s, password: pw, isActive: true, platformRole: "ACADEMY_STUDENT", tenantId: tenant.id, roleId: roleStudent.id },
    update: {},
  })));

  // ── Curso ────────────────────────────────────────────────
  const course = await prisma.academyCourse.upsert({
    where: { id: "kaledacademy-bootcamp-2025" },
    create: {
      id: "kaledacademy-bootcamp-2025",
      title: "AI SaaS Engineering Bootcamp",
      description: "Construye, lanza y monetiza tu propio SaaS. No eres un coder — eres un arquitecto de sistemas.",
      category: "Desarrollo Web · IA · SaaS",
      duration: "4 meses", level: "Base → Intermedio",
      price: 1800000, durationWeeks: 16,
      isActive: true, tenantId: tenant.id, createdById: admin.id,
    },
    update: { isActive: true },
  });

  // ── Cohorte y matrículas ─────────────────────────────────
  const cohort = await prisma.academyCohort.upsert({
    where: { id: "kaledacademy-cohort-2025-1" },
    create: {
      id: "kaledacademy-cohort-2025-1",
      name: "Cohorte 2025-1 · Montería",
      startDate: new Date("2025-03-03"), endDate: new Date("2025-06-27"),
      maxStudents: 15, currentStudents: estudiantes.length,
      status: "ACTIVE",
      schedule: { days: ["LUNES", "MIERCOLES", "VIERNES"], time: "18:00", duration: 180, timezone: "America/Bogota" },
      courseId: course.id, tenantId: tenant.id,
    },
    update: { currentStudents: estudiantes.length },
  });
  for (const est of estudiantes) {
    await prisma.academyEnrollment.upsert({
      where: { userId_courseId: { userId: est.id, courseId: course.id } },
      create: { userId: est.id, courseId: course.id, cohortId: cohort.id, status: "ACTIVE", progress: 0 },
      update: {},
    });
  }

  // ── Badges ───────────────────────────────────────────────
  const badges = [
    { name: "Primera sesión", icon: "🎯", condition: "LESSONS_COMPLETED", threshold: 1 },
    { name: "Semana 1 completa", icon: "📅", condition: "LESSONS_COMPLETED", threshold: 3 },
    { name: "Mitad del camino", icon: "⚡", condition: "LESSONS_COMPLETED", threshold: 24 },
    { name: "Bootcamp completo", icon: "🏆", condition: "LESSONS_COMPLETED", threshold: 48 },
    { name: "Primer entregable", icon: "📦", condition: "DELIVERABLES_APPROVED", threshold: 1 },
    { name: "Shipper activo", icon: "🚀", condition: "DELIVERABLES_APPROVED", threshold: 8 },
    { name: "Master shipper", icon: "🌟", condition: "DELIVERABLES_APPROVED", threshold: 16 },
    { name: "Primera respuesta correcta", icon: "🧠", condition: "QUIZ_PERFECT_SCORE", threshold: 1 },
    { name: "Primer deploy", icon: "☁️", condition: "FIRST_DEPLOY", threshold: null },
    { name: "3 usuarios reales", icon: "👥", condition: "REAL_USERS_3", threshold: null },
    { name: "CRAL completo", icon: "⚙️", condition: "ALL_CRAL_DONE", threshold: null },
    { name: "Demo Day aprobado", icon: "🎓", condition: "DEMO_DAY_PASSED", threshold: null },
  ];
  for (const b of badges) {
    await prisma.academyBadge.upsert({
      where: { name_tenantId: { name: b.name, tenantId: tenant.id } },
      create: { ...b, description: b.name, tenantId: tenant.id, isActive: true, condition: b.condition as any },
      update: {},
    });
  }

  // ── Módulos ───────────────────────────────────────────────
  await seedModulo1(prisma, course.id, tenant.id);
  await seedModulo2(prisma, course.id, tenant.id);
  await seedModulo3(prisma, course.id, tenant.id);
  await seedModulo4(prisma, course.id, tenant.id);

  // ── Memoria inicial de Kaled ─────────────────────────────
  const memorias = [
    { category: "empresa_referencia", content: "KaledSoft Technologies es una empresa colombiana en Montería que construye aplicaciones web para negocios. Sus productos: KaledDental (clínicas odontológicas), KaledWash (lavaderos de autos), KaledPark (parqueaderos), KaledSchool (academias). Los estudiantes aprenden construyendo algo similar a estos productos.", score: 100 },
    { category: "pedagogia_progresiva", content: "REGLA ABSOLUTA: Kaled nunca menciona un concepto que no haya sido enseñado en sesiones previas. En el Módulo 1 no se menciona React, Next.js, Prisma, npm ni node_modules. Solo se habla de lo que el estudiante ya vio.", score: 100 },
    { category: "metodo_socratico", content: "Kaled nunca da la solución directa. Siempre pregunta primero: ¿Qué intentaste? ¿Qué crees que debería pasar? ¿Qué dice el error? El estudiante piensa antes de recibir ayuda.", score: 98 },
    { category: "cral_metodologia", content: "CONSTRUIR (70%): el estudiante intenta antes de pedir ayuda. ROMPER (10%): experimenta deliberadamente para entender por qué funciona. AUDITAR (10%): revisa con criterio crítico. LANZAR (10%): el resultado siempre existe en internet, nunca solo en local.", score: 95 },
    { category: "nivel_inicial", content: "Los estudiantes del bootcamp empiezan desde cero. No saben qué es HTML, CSS, JavaScript ni Git. Kaled explica todo desde los fundamentos, sin asumir conocimiento previo. Las analogías deben ser de la vida cotidiana colombiana.", score: 92 },
  ];
  for (const mem of memorias) {
    await prisma.agentMemory.create({
      data: { agentType: "KALED", tenantId: tenant.id, ...mem, metadata: { source: "seed_v3" } },
    });
  }

  console.log("\n✅ Seed V3 completado!");
  console.log(`   Tenant: kaledacademy`);
  console.log(`   Módulos: 4 | Sesiones: 48`);
  console.log(`   Estudiantes demo: ${estudiantes.length}`);
  console.log(`   Contenido: pedagógicamente progresivo`);
}

// ============================================================
// MÓDULO 1 — Cómo funciona la web + Git + HTML + CSS + JS
// Semanas 1–4 · 12 sesiones
//
// VOCABULARIO PERMITIDO en este módulo:
// internet, página web, navegador, URL, dominio, servidor,
// dirección web, carpeta, archivo, terminal, Git, repositorio,
// commit, HTML, CSS, JavaScript, consola del navegador
//
// VOCABULARIO PROHIBIDO (aún no explicado):
// React, Next.js, npm, node_modules, Prisma, base de datos,
// API, JSON, fetch, componente, estado, hook, framework
// ============================================================

async function seedModulo1(prisma: PrismaClient, courseId: string, tenantId: string) {
  console.log("  📦 Módulo 1 — Fundamentos de la web");

  const mod = await prisma.academyModule.create({
    data: {
      title: "Módulo 1 — Cómo funciona la web",
      description: "Aprende cómo funciona internet, cómo guardar tu código profesionalmente con Git, y cómo construir páginas web con HTML, CSS y JavaScript.",
      order: 1, isActive: true, courseId,
    },
  });

  // ── SESIÓN 1 ─────────────────────────────────────────────
  await crearSesion(prisma, mod.id, tenantId, {
    orden: 1, semana: 1, dia: "LUNES",
    sessionType: "TEORIA", duracion: 180,
    titulo: "El viaje de una URL: cómo funciona internet",
    descripcion: "Qué pasa desde que escribes una dirección web hasta que ves la página. DNS, servidores, y el viaje completo explicado paso a paso.",
    video: { url: "https://www.youtube.com/watch?v=7_LPdttKXPc", titulo: "¿Cómo funciona internet? — Explicación visual" },

    historia: `En 1969, cuatro universidades en Estados Unidos conectaron sus computadoras por primera vez. El primer mensaje que intentaron enviar fue "LOGIN", pero el sistema colapsó después de las primeras dos letras. Solo llegó "LO".

Ese fue el nacimiento de internet. Una red diseñada para que si un camino falla, los datos encuentren otro camino distinto para llegar a su destino.

En 1991, Tim Berners-Lee, un científico en Suiza, inventó algo encima de internet: la World Wide Web. Una forma de crear documentos que se enlazaban entre sí, y que cualquier persona en el mundo podía leer desde su computadora. El primer sitio web del mundo todavía existe en: info.cern.ch

Desde ese día, cada vez que abres una página web desde tu celular o computador, ocurre el mismo proceso que aprenderás hoy.`,

    kaledIntro: `Bienvenido al bootcamp. Hoy empieza todo.

Antes de escribir una sola línea de código, necesitas entender el sistema sobre el que vas a construir. La mayoría de personas aprenden a hacer páginas web sin entender qué pasa cuando alguien las abre. Eso es como aprender a manejar sin saber qué es un motor.

Hoy vas a entender el viaje completo desde que alguien escribe una dirección en su navegador hasta que ve la página. Este conocimiento te va a acompañar por los 4 meses del bootcamp y por toda tu carrera.`,

    analogia: `Piensa en enviar una carta por correo.

Tú escribes la dirección del destinatario en el sobre. El cartero no conoce de memoria dónde queda esa dirección — consulta con la oficina de correos central, que tiene el directorio de todas las direcciones del país. Una vez que encuentra la dirección exacta, lleva la carta por el camino más rápido. El destinatario la recibe, lee lo que pediste, y te manda de vuelta lo que necesitas.

Cuando escribes una dirección web, pasa exactamente lo mismo. Solo que en milisegundos, sin cartero, y sin papel.`,

    conceptos: [
      {
        key: "internet",
        titulo: "Internet — La red de redes",
        historia: "Internet nació en 1969 como una red militar llamada ARPANET. La idea era que si un punto de la red era destruido, la información encontrara otro camino. Hoy conecta miles de millones de dispositivos en todo el mundo.",
        cuerpo: `Internet es simplemente una red enorme de computadoras conectadas entre sí por cables (bajo el mar, entre países) y señales (WiFi, 4G, fibra óptica).

Cuando tu celular se conecta a internet, se une a esa red. Desde ahí puede comunicarse con cualquier otra computadora del mundo que también esté conectada.

Tu internet en casa llega por un cable de fibra óptica o por señal de un proveedor como ETB, Claro, o Telmex. Ese proveedor te da acceso a la red global.

Internet no tiene un dueño. Es una red descentralizada — nadie la controla por completo. Por eso es tan resistente: si un camino falla, los datos encuentran otro.`,
      },
      {
        key: "pagina-web",
        titulo: "Página web — Un documento que vive en internet",
        historia: "Las primeras páginas web eran solo texto con algunos enlaces. Sin imágenes, sin colores, sin estilos. Solo texto y hipervínculos entre documentos.",
        cuerpo: `Una página web es un documento que vive en una computadora conectada a internet. Ese documento está escrito en un lenguaje especial que los navegadores entienden y muestran visualmente.

La diferencia entre una página web y un documento de Word es que la página web puede enlazarse con otras páginas, puede mostrar imágenes de cualquier parte del mundo, y puede actualizarse sin que tengas que descargar nada.

Cada vez que ves una página web — una noticia, una tienda, una red social — estás viendo un documento que alguien escribió y guardó en una computadora encendida en algún lugar del mundo.`,
      },
      {
        key: "navegador",
        titulo: "Navegador — El que traduce y muestra",
        historia: "El primer navegador web popular se llamó Mosaic, creado en 1993. Fue el primero en mostrar imágenes junto al texto. Antes, las páginas web eran solo texto.",
        cuerpo: `El navegador es el programa que usas para ver páginas web. Chrome, Firefox, Safari, Edge — todos son navegadores.

Su trabajo es pedir una página web a una computadora remota, recibir el documento que le mandan, y mostrártelo de forma visual: con colores, imágenes, botones y texto bien organizado.

El navegador es como un traductor. Las páginas web están escritas en un idioma técnico. El navegador lo traduce a lo que tú ves en pantalla.

Sin navegador, verías el código puro de las páginas web — texto lleno de símbolos que los humanos difícilmente podemos leer directamente.`,
      },
      {
        key: "url-dominio",
        titulo: "Dirección web (URL) — Cómo identificar cada página",
        historia: "URL significa Uniform Resource Locator. Fue inventado por Tim Berners-Lee en 1991 como una forma estándar de identificar cualquier documento en internet.",
        cuerpo: `Una dirección web — también llamada URL — es la dirección exacta de una página en internet. Funciona igual que la dirección de una casa: le dice al sistema exactamente dónde encontrar lo que buscas.

Una URL tiene partes. Por ejemplo: https://kaledsoft.tech/contacto

— "https" indica el tipo de comunicación (segura en este caso)
— "kaledsoft.tech" es el nombre del sitio, llamado dominio
— "/contacto" indica qué página específica dentro de ese sitio

El dominio es el nombre fácil de recordar. Por debajo, cada sitio web tiene una dirección numérica (como un número de teléfono) que las computadoras usan para encontrarse. El DNS convierte el nombre legible en ese número.`,
      },
      {
        key: "dns",
        titulo: "DNS — El directorio de internet",
        historia: "En los primeros años de internet había tan pocas computadoras que todos guardaban una lista manual de cada máquina. Cuando esa lista se volvió demasiado grande en 1983, Paul Mockapetris inventó el DNS.",
        cuerpo: `DNS significa Sistema de Nombres de Dominio. Es como el directorio telefónico de internet, pero automático.

Cuando escribes "kaledsoft.tech" en tu navegador, tu computadora no sabe dónde queda ese sitio. Entonces consulta a un servidor DNS — una computadora especial cuyo único trabajo es tener ese directorio — y le pregunta: "¿dónde está kaledsoft.tech?"

El servidor DNS responde con la dirección numérica real del sitio. Tu navegador usa esa dirección para ir directamente al servidor correcto y pedir la página.

Todo esto ocurre en menos de un segundo, completamente invisible para ti.`,
      },
      {
        key: "servidor",
        titulo: "Servidor — La computadora que guarda las páginas",
        historia: "Los primeros servidores eran computadoras comunes que las personas dejaban encendidas en su casa u oficina. Hoy son computadoras especializadas en edificios enormes llamados centros de datos.",
        cuerpo: `Un servidor es una computadora que está siempre encendida, siempre conectada a internet, y cuyo trabajo es guardar páginas web y entregarlas cuando alguien las pide.

Cuando alguien crea un sitio web, sube sus archivos a un servidor. Ese servidor está disponible las 24 horas del día, los 7 días de la semana. Cuando tú abres ese sitio desde tu celular, tu celular le pide al servidor que te mande esos archivos.

El servidor no tiene pantalla ni teclado. Es una computadora sin cara, guardada en un edificio especial con electricidad de respaldo, refrigeración, y conexiones de internet muy rápidas.`,
      },
      {
        key: "seguridad-https",
        titulo: "El candado de seguridad (HTTPS)",
        historia: "En los primeros años de internet, toda la información viajaba sin protección — como una postal que cualquiera podía leer. En los años 90 se inventó un sistema de cifrado para proteger esa comunicación.",
        cuerpo: `Cuando la dirección de una página empieza con "https" — con esa "s" al final — significa que la comunicación entre tu computadora y el servidor está protegida. Nadie en el medio puede leer lo que envías o recibes.

En tu navegador esto aparece como un pequeño candado junto a la dirección. Ese candado significa: esta conversación es privada.

Es especialmente importante cuando escribes contraseñas o datos personales. Sin ese candado, esa información viajaría como una postal abierta que cualquiera en la misma red WiFi podría leer.`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Observa el viaje en tu navegador",
        descripcion: `Abre tu navegador (Chrome, Firefox, o el que tengas). Entra a cualquier página web que uses frecuentemente — una red social, un periódico, cualquiera.

Ahora abre las herramientas del desarrollador: presiona F12 en Windows, o Cmd+Opción+I en Mac. Ve a la pestaña que dice "Red" o "Network". Recarga la página.

Verás una lista de peticiones que hizo tu navegador para cargar esa página. Observa: ¿cuántas peticiones se hicieron? ¿Cuántos milisegundos tardó la primera?

Escribe en tu cuaderno lo que observaste con tus propias palabras.`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa cuando internet falla?",
        descripcion: `Desconecta el WiFi de tu computadora (o activa el modo avión en tu celular). Intenta abrir una página web que no hayas visitado antes.

¿Qué mensaje muestra el navegador? ¿Cuál parte del viaje que estudiamos hoy falló?

Ahora vuelve a conectar y abre la misma página. ¿Funciona inmediatamente o tarda un momento? ¿Por qué crees que tarda ese momento?

Escribe las respuestas en tu cuaderno.`,
      },
      {
        phase: "AUDITAR",
        titulo: "Pregúntale a Kaled y evalúa su respuesta",
        descripcion: `Pregúntale a Kaled: "Explícame con tus propias palabras qué pasa cuando escribo una dirección web y presiono Enter."

Lee su respuesta cuidadosamente. Luego evalúa:
— ¿Mencionó todos los pasos que aprendiste hoy?
— ¿Hay algo que dijo que no entendiste?
— ¿Hay algo que crees que está incompleto o incorrecto?

Escribe tu evaluación en el cuaderno. Si encontraste algo incompleto, escribe cómo lo mejorarías.`,
      },
      {
        phase: "LANZAR",
        titulo: "Explícaselo a alguien",
        descripcion: `Explícale a alguien que no sabe de tecnología — un familiar, un amigo, cualquier persona — qué pasa cuando se abre una página web. Usa la analogía de la carta de correo.

Si puedes explicarlo con palabras sencillas y la persona lo entiende, tú lo entendiste. Si te trancas, es una señal de qué partes debes repasar.

Escribe en tu cuaderno cómo lo explicaste y qué preguntas te hizo esa persona.`,
      },
    ],

    quiz: {
      pregunta: `María abre su navegador en casa y escribe la dirección de su banco. El navegador dice "No se puede acceder a este sitio". Su internet funciona bien porque puede abrir otras páginas sin problema. ¿Cuál es la explicación más probable?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: "El computador de María está dañado.",
          feedback: "Si el computador estuviera dañado, no podría abrir ninguna página. Pero el enunciado dice que sí puede abrir otras páginas. El problema es específico del sitio del banco, no del computador.",
        },
        {
          label: "B", esCorrecta: true,
          texto: "El servidor del banco tiene un problema — el banco existe pero su computadora no está respondiendo en este momento.",
          feedback: "¡Correcto! Si el internet de María funciona y puede abrir otras páginas, su viaje hasta el DNS está bien. El problema está al final del viaje: el servidor del banco no responde. Eso puede ocurrir por mantenimiento, una falla técnica, o demasiadas personas accediendo al mismo tiempo.",
        },
        {
          label: "C", esCorrecta: false,
          texto: "El navegador de María no conoce la dirección del banco.",
          feedback: "El navegador no necesita conocer la dirección — para eso existe el DNS. Cuando María escribe la dirección, el DNS la busca automáticamente. Si el DNS no la encontrara, el error sería diferente.",
        },
        {
          label: "D", esCorrecta: false,
          texto: "María escribió mal la dirección web.",
          feedback: "Podría ser, pero el enunciado no lo indica. Si hubiera escrito mal la dirección, el DNS no encontraría nada y el mensaje de error sería distinto — normalmente dice que la dirección no existe, no que no se puede acceder.",
        },
      ],
    },
  });

  // ── SESIÓN 2 ─────────────────────────────────────────────
  await crearSesion(prisma, mod.id, tenantId, {
    orden: 2, semana: 1, dia: "MIERCOLES",
    sessionType: "PRACTICA", duracion: 180,
    titulo: "Las herramientas del desarrollador y tu primera página",
    descripcion: "Explora las herramientas del navegador, entiende qué es el código fuente de una página, y crea tu primer archivo HTML.",
    video: { url: "https://www.youtube.com/watch?v=WTRiv7r5lXY", titulo: "Herramientas del desarrollador de Chrome" },

    historia: `Cuando Tim Berners-Lee creó la primera página web, la escribió en un archivo de texto plano. Sin programas especiales, sin interfaces gráficas. Solo texto, con unos símbolos especiales que el navegador entendía.

Ese archivo de texto todavía es la base de todo lo que ves en internet hoy. Cada página web, por compleja que parezca, empieza siendo un archivo de texto que alguien escribió.

Los navegadores modernos tienen herramientas que te permiten ver ese texto oculto detrás de cualquier página. Hoy vas a usarlas por primera vez.`,

    kaledIntro: `En la sesión anterior entendiste el viaje de una página web. Hoy vas a ver por dentro cómo está hecha.

Todos los sitios web que usas tienen su código visible. Cualquier persona puede verlo. Eso es una de las cosas más poderosas de la web: es abierta por diseño.

Hoy vas a abrir ese código, entenderlo por primera vez, y crear tu propio archivo de página web desde cero. Sin herramientas complicadas — solo un editor de texto y tu navegador.`,

    analogia: `El código fuente de una página web es como la receta de un plato de comida en un restaurante.

El comensal ve el plato terminado: presentación bonita, colores, todo listo para comer. Pero detrás existe una receta escrita con ingredientes y pasos específicos que el cocinero siguió.

El navegador es el cocinero: toma la receta (el código) y la convierte en el plato (la página visual). Las herramientas del desarrollador te permiten ver esa receta mientras observas el plato terminado.`,

    conceptos: [
      {
        key: "codigo-fuente",
        titulo: "Código fuente — La receta de una página web",
        cuerpo: `El código fuente es el texto con instrucciones que el navegador usa para construir la página que ves.

Para verlo en cualquier página: haz clic derecho sobre la página y selecciona "Ver código fuente" o "Ver código de página". Se abrirá una ventana llena de texto con símbolos como < y >.

Ese texto es lo que el servidor le envió a tu navegador. El navegador lo leyó y construyó la página visual a partir de esas instrucciones.

Puedes ver el código fuente de cualquier página web del mundo. Todo es público y visible.`,
      },
      {
        key: "editor-texto",
        titulo: "Editor de texto — Tu herramienta de trabajo",
        cuerpo: `Un editor de texto es el programa donde escribirás tu código. No es como Word o Google Docs — no tiene botones de negrita ni tamaño de letra. Solo muestra texto plano.

El editor que usaremos se llama Visual Studio Code (VS Code). Es gratuito, lo usan millones de desarrolladores en el mundo, y tiene muchas funciones que te ayudarán a medida que aprendas.

Por ahora, piensa en VS Code como el cuaderno donde escribirás tus páginas web. Lo que escribas ahí, el navegador lo convertirá en páginas visuales.

Descárgalo gratis en: code.visualstudio.com`,
      },
      {
        key: "archivo-html",
        titulo: "El archivo .html — Donde vive tu página",
        cuerpo: `Una página web es un archivo guardado en tu computadora con la extensión .html al final del nombre.

Cuando creas un archivo llamado "index.html" y lo abres con tu navegador, el navegador lo lee y muestra la página que escribiste.

Por convención, la página principal de cualquier sitio web siempre se llama "index.html". Es la primera página que el servidor busca cuando alguien visita el sitio.

Puedes crear tantos archivos .html como quieras. Cada uno puede ser una página diferente de tu sitio.`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Crea tu primer archivo HTML",
        descripcion: `Instala VS Code si no lo tienes (code.visualstudio.com). Abre VS Code y crea un archivo nuevo. Guárdalo con el nombre "mi-primera-pagina.html" en una carpeta que puedas encontrar fácilmente.

Escribe exactamente esto en el archivo:

<!DOCTYPE html>
<html>
  <head>
    <title>Mi primera página</title>
  </head>
  <body>
    <h1>Hola, soy [tu nombre]</h1>
    <p>Esta es mi primera página web.</p>
  </body>
</html>

Guarda el archivo. Luego búscalo en tu computadora y ábrelo con tu navegador haciendo doble clic o arrastrándolo al navegador. ¿Qué ves?`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa si cierras una etiqueta mal?",
        descripcion: `En tu archivo "mi-primera-pagina.html", elimina el símbolo "/" del cierre de una etiqueta. Por ejemplo, cambia "</h1>" por "<h1>".

Guarda y recarga en el navegador. ¿Qué pasó? ¿El navegador muestra un error o intenta mostrarlo de todas formas?

Vuelve a corregir el archivo. Ahora prueba eliminar una etiqueta de apertura completa — por ejemplo, borra el "<body>" de apertura. ¿Qué pasa esta vez?`,
      },
      {
        phase: "AUDITAR",
        titulo: "Ver el código de una página real",
        descripcion: `Entra a una página web real que uses frecuentemente. Haz clic derecho sobre la página y selecciona "Ver código fuente".

Busca en ese código las letras "h1" o "title". ¿Las encuentras? ¿Qué texto aparece entre esas etiquetas?

Ahora compara ese código con el archivo que tú escribiste. ¿Qué similitudes encuentras? ¿Qué cosas nuevas ves que todavía no entiendes?

Escribe tus observaciones en el cuaderno.`,
      },
      {
        phase: "LANZAR",
        titulo: "Muestra tu primera página",
        descripcion: `Toma una captura de pantalla de tu primera página web funcionando en el navegador.

Compártela en el grupo de WhatsApp o el canal de comunicación del bootcamp con el mensaje: "Primera página web creada. [Tu nombre]."

Es el primer paso de muchos. Guarda también el archivo .html en una carpeta organizada — lo vas a necesitar en las próximas sesiones.`,
      },
    ],

    quiz: {
      pregunta: `Camilo guardó su página web con el nombre "pagina.txt" y la abrió con el navegador. El navegador mostró el texto del código en lugar de la página visual. ¿Por qué?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: "El navegador de Camilo está desactualizado.",
          feedback: "El navegador no es el problema. Los navegadores modernos funcionan igual con archivos .html. El problema está en el nombre del archivo.",
        },
        {
          label: "B", esCorrecta: false,
          texto: "Camilo cometió un error en el código HTML.",
          feedback: "El código puede estar perfecto, pero si el archivo tiene extensión .txt, el navegador lo trata como texto plano y muestra el contenido sin interpretarlo como HTML.",
        },
        {
          label: "C", esCorrecta: true,
          texto: "El archivo tiene extensión .txt en lugar de .html, por eso el navegador no sabe que debe interpretarlo como una página web.",
          feedback: "¡Correcto! La extensión del archivo le dice al sistema operativo y al navegador qué tipo de archivo es. Con .txt, el navegador lo abre como texto plano. Con .html, lo interpreta como una página web y la muestra visualmente.",
        },
        {
          label: "D", esCorrecta: false,
          texto: "El código necesita estar en un servidor para funcionar.",
          feedback: "No es necesario un servidor para ver una página web localmente. Puedes abrir un archivo .html directamente desde tu computadora con el navegador y funcionará.",
        },
      ],
    },
  });

  // ── SESIÓN 3 ─────────────────────────────────────────────
  await crearSesion(prisma, mod.id, tenantId, {
    orden: 3, semana: 1, dia: "VIERNES",
    sessionType: "ENTREGABLE", duracion: 180,
    titulo: "HTML: la estructura de toda página web",
    descripcion: "Aprende las etiquetas HTML fundamentales y construye la estructura de una página web completa para presentarte al mundo.",
    video: { url: "https://www.youtube.com/watch?v=MJkdaVFHrto", titulo: "HTML desde cero — Aprende las etiquetas básicas" },

    historia: `HTML fue inventado por Tim Berners-Lee en 1991 para compartir documentos científicos entre investigadores. La idea era simple: un documento de texto con marcas especiales que cualquier computadora pudiera leer e interpretar.

Esas "marcas" eran etiquetas entre los símbolos menor-que y mayor-que. Por ejemplo, para indicar un título, se usaba una etiqueta especial. Para un párrafo, otra etiqueta diferente.

Treinta años después, esas mismas etiquetas siguen siendo la base de todo lo que ves en internet. Instagram, Twitter, Wikipedia, las páginas del gobierno — todo está construido sobre HTML.`,

    kaledIntro: `En las dos sesiones anteriores entendiste cómo funciona internet y creaste tu primer archivo HTML. Ahora vas a aprender las etiquetas que necesitas para construir páginas reales.

HTML es el lenguaje de la estructura. No se ocupa de los colores ni del diseño visual — eso lo aprenderás después. HTML solo define qué es cada cosa: este es un título, esto es un párrafo, esto es una imagen, esto es un enlace.

Es como el esqueleto de una persona. Sin esqueleto no hay estructura. Sin HTML no hay página web.`,

    analogia: `Piensa en un periódico impreso.

Un periódico tiene partes claramente diferenciadas: el nombre del periódico arriba (la cabecera), artículos con títulos grandes, párrafos de texto, imágenes con pie de foto, publicidad a los lados.

HTML hace exactamente lo mismo con las páginas web. Le dice al navegador: esto es el encabezado de la página, esto es un título de artículo, esto es un párrafo de texto, esto es una imagen, esto es un pie de página.

El navegador usa esa información para organizar y mostrar el contenido de forma apropiada para cada tipo de elemento.`,

    conceptos: [
      {
        key: "etiquetas",
        titulo: "Etiquetas HTML — Cómo marcar el contenido",
        cuerpo: `Las etiquetas HTML son los símbolos especiales que le dicen al navegador qué tipo de contenido es cada cosa.

Casi todas las etiquetas vienen en pareja: una de apertura y una de cierre. La de cierre tiene una barra "/" antes del nombre.

Por ejemplo: <h1>Este es un título principal</h1>

El texto entre las dos etiquetas es el contenido. Las etiquetas le dicen al navegador cómo tratar ese contenido.

Las etiquetas más usadas:
— h1 a h6: títulos (h1 es el más grande, h6 el más pequeño)
— p: párrafo de texto
— img: imagen
— a: enlace a otra página
— div: agrupador de contenido`,
      },
      {
        key: "estructura-html",
        titulo: "La estructura obligatoria de todo archivo HTML",
        cuerpo: `Todo archivo HTML debe tener una estructura básica que el navegador espera encontrar:

<!DOCTYPE html>
Esta línea le dice al navegador que el archivo es HTML moderno.

<html>
El contenedor de toda la página.

<head>
La sección invisible de la página. Aquí va información sobre la página que el navegador necesita pero que el usuario no ve directamente: el título de la pestaña, el idioma, instrucciones de visualización.

<body>
Todo lo que el usuario ve en la página va aquí: títulos, párrafos, imágenes, botones, todo.

Sin esta estructura, el navegador puede tener problemas para mostrar la página correctamente.`,
      },
      {
        key: "semantica",
        titulo: "HTML semántico — Significado, no solo presentación",
        cuerpo: `"Semántico" significa que cada etiqueta tiene un significado específico que va más allá de cómo se ve.

Por ejemplo, h1 no significa "texto grande". Significa "este es el título principal de esta página". El navegador lo muestra grande por defecto, pero su significado real es de jerarquía.

¿Por qué importa esto? Porque los motores de búsqueda como Google leen el HTML para entender de qué trata tu página. Si usas h1 para el título principal, Google entiende que ese es el tema central.

También importa para las personas que usan lectores de pantalla por discapacidad visual. El lector anuncia los títulos diferente a los párrafos porque entiende la semántica.`,
      },
      {
        key: "atributos",
        titulo: "Atributos — Información adicional de las etiquetas",
        cuerpo: `Los atributos son información adicional que se pone dentro de la etiqueta de apertura. Le dan más detalles al navegador sobre ese elemento.

Por ejemplo, la etiqueta de imagen necesita un atributo que indique dónde está la imagen:
<img src="foto.jpg" alt="Mi foto de perfil">

— src indica la ubicación de la imagen (source = fuente)
— alt es el texto alternativo que aparece si la imagen no carga, y que leen los lectores de pantalla

La etiqueta de enlace necesita saber a dónde va:
<a href="https://kaledsoft.tech">Visitar KaledSoft</a>

— href indica la dirección a la que lleva el enlace`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Página de presentación personal",
        descripcion: `Crea un archivo nuevo llamado "index.html". Esta será tu página de presentación personal.

La página debe tener:
— Un título principal con tu nombre (usa h1)
— Un subtítulo que diga qué eres o qué estudias (usa h2)
— Un párrafo corto presentándote (usa p)
— Al menos un enlace a una red social que uses (usa a con href)
— Una lista de 3 cosas que te interesan o tus hobbies

Recuerda la estructura obligatoria: DOCTYPE, html, head con title, y body con todo el contenido.`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa si usas h1 múltiples veces?",
        descripcion: `En tu página, agrega tres etiquetas h1 con textos diferentes. Guarda y mira cómo queda.

¿El navegador muestra error? ¿Funciona de todas formas? ¿Cómo se ve visualmente?

Ahora piensa: ¿por qué crees que se recomienda usar solo un h1 por página? (Pista: piensa en lo que aprendiste sobre semántica y el significado de h1 como "título principal").`,
      },
      {
        phase: "AUDITAR",
        titulo: "Busca errores comunes en código generado",
        descripcion: `Pídele a Kaled que te muestre el HTML de una página de presentación personal.

Cuando te responda, revisa:
— ¿Tiene la estructura obligatoria completa (DOCTYPE, html, head, body)?
— ¿Usa más de un h1?
— ¿Las imágenes tienen atributo alt?
— ¿Los enlaces tienen atributo href?
— ¿Todas las etiquetas están correctamente cerradas?

Escribe qué encontraste bien y qué mejorarías.`,
      },
      {
        phase: "LANZAR",
        titulo: "Entregable semana 1: tu página personal",
        descripcion: `Tu página "index.html" debe estar lista con todo el contenido de presentación personal.

Comparte el archivo en el canal del bootcamp o envíalo al instructor. Asegúrate de que:
— Se puede abrir con el navegador sin errores
— Tiene tu nombre, una descripción, y al menos un enlace
— Tiene la estructura HTML completa y correcta

Esta es la base de todo lo que construirás durante el bootcamp.`,
      },
    ],

    quiz: {
      pregunta: `Luisa está construyendo su página personal. Quiere agregar un enlace que lleve a su perfil de LinkedIn. ¿Cuál de estas opciones es correcta?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: "<a>https://linkedin.com/in/luisa</a>",
          feedback: "Esta etiqueta no tiene el atributo href que le dice al navegador a dónde va el enlace. Sin href, el texto aparece pero no funciona como enlace.",
        },
        {
          label: "B", esCorrecta: true,
          texto: '<a href="https://linkedin.com/in/luisa">Mi LinkedIn</a>',
          feedback: "¡Correcto! El atributo href indica la dirección a la que lleva el enlace. El texto entre las etiquetas (Mi LinkedIn) es lo que el usuario ve y puede hacer clic.",
        },
        {
          label: "C", esCorrecta: false,
          texto: "<enlace>https://linkedin.com/in/luisa</enlace>",
          feedback: 'En HTML, la etiqueta para crear enlaces es "a", no "enlace". HTML tiene etiquetas predefinidas y cada una tiene un nombre específico que el navegador reconoce.',
        },
        {
          label: "D", esCorrecta: false,
          texto: '<a href>https://linkedin.com/in/luisa</a>',
          feedback: "El atributo href necesita tener el valor de la dirección. Escribir solo href sin el valor (= y la dirección) no funciona correctamente.",
        },
      ],
    },

    entregable: {
      titulo: "Página de presentación personal en HTML",
      descripcion: "Tu primera página web construida desde cero con HTML. Debe presentarte al mundo con tu nombre, una descripción, y al menos un enlace.",
      esFinal: false,
      items: [
        "El archivo se llama index.html y abre correctamente en el navegador",
        "Tiene la estructura HTML completa: DOCTYPE, html, head con title, y body",
        "Tiene un h1 con tu nombre completo",
        "Tiene al menos un párrafo (p) presentándote",
        "Tiene al menos un enlace (a) funcionando con href",
        "Tiene al menos una lista con 3 elementos",
        "Puedes explicar qué hace cada etiqueta que usaste",
      ],
    },
  });

  // ── SESIÓN 4 ─────────────────────────────────────────────
  await crearSesion(prisma, mod.id, tenantId, {
    orden: 4, semana: 2, dia: "LUNES",
    sessionType: "TEORIA", duracion: 180,
    titulo: "Git: nunca más perderás tu trabajo",
    descripcion: "Qué es el control de versiones, por qué existe Git, y cómo empezar a guardar el historial de tu código de forma profesional.",
    video: { url: "https://www.youtube.com/watch?v=hwP7WQkmECE", titulo: "Git y GitHub para principiantes" },

    historia: `Antes de que existiera Git, los desarrolladores guardaban copias de su trabajo con nombres como "proyecto_final.html", "proyecto_final_v2.html", "proyecto_final_ESTE_SI.html".

Si algo salía mal, tenían que buscar cuál versión era la correcta entre decenas de carpetas con nombres confusos. Si dos personas trabajaban en el mismo archivo al mismo tiempo, sus cambios se pisaban y uno de los dos perdía su trabajo.

En 2005, Linus Torvalds — el mismo que creó el sistema operativo Linux — decidió resolver este problema de una vez por todas. Creó Git: un sistema que guarda el historial completo de un proyecto y permite que múltiples personas trabajen en él sin pisarse.

Hoy, Git es la herramienta de control de versiones más usada en el mundo.`,

    kaledIntro: `Git es la herramienta más importante que aprenderás en este bootcamp después del código mismo.

No importa qué tan bueno seas escribiendo páginas web — si no tienes el historial de tu código, si no puedes volver atrás cuando algo sale mal, si no puedes colaborar con otras personas, no eres un desarrollador profesional.

Hoy aprendes Git desde cero. No es complicado — hay cuatro comandos que usarás el 90% del tiempo. El resto lo aprenderás cuando lo necesites.`,

    analogia: `Git es la máquina del tiempo de tu código.

Imagina que estás construyendo una maqueta para el colegio. Cada vez que terminas una parte importante, tomas una fotografía. Si algo se daña o lo arruinas mientras trabajas, puedes mirar la fotografía y volver exactamente a cómo estaba en ese momento.

En Git, cada fotografía se llama "commit". Puedes tomar fotografías cuando quieras, darles un nombre descriptivo, y volver a cualquiera de ellas en cualquier momento.

Además, Git te permite hacer copias del proyecto para experimentar sin miedo — si el experimento sale mal, simplemente vuelves a la versión estable.`,

    conceptos: [
      {
        key: "control-versiones",
        titulo: "Control de versiones — El historial de tu trabajo",
        cuerpo: `El control de versiones es un sistema que guarda el historial completo de todos los cambios que haces en tus archivos.

En lugar de guardar solo la versión actual, guarda cada versión anterior también. Puedes ver qué cambió, cuándo cambió, y volver a cualquier versión anterior cuando quieras.

Es como tener un cuaderno con borrador infinito donde cada borrador queda guardado. Nunca pierdes nada — solo deja de ser la versión más reciente.`,
      },
      {
        key: "repositorio",
        titulo: "Repositorio — La carpeta con historial",
        cuerpo: `Un repositorio (o "repo") es una carpeta que Git está monitoreando. Git observa todos los cambios que haces dentro de esa carpeta y los puede guardar en el historial.

Cuando conviertes una carpeta en repositorio de Git, se crea una carpeta oculta llamada ".git" dentro de ella. Ahí Git guarda todo el historial. No debes tocar esa carpeta oculta — Git la maneja solo.

Tus archivos de proyecto van normalmente en la carpeta. La carpeta oculta .git es solo el almacén del historial.`,
      },
      {
        key: "commit",
        titulo: "Commit — Una fotografía del proyecto",
        cuerpo: `Un commit es una fotografía del estado de tu proyecto en un momento específico. Cada commit tiene:

— Los archivos tal como estaban en ese momento
— Un mensaje que describes tú explicando qué cambiaste
— La fecha y hora exacta
— Tu nombre (para saber quién hizo cada cambio)

Los commits se acumulan formando un historial. Puedes ver todos los commits anteriores y volver a cualquiera de ellos.

La clave de un buen commit es el mensaje. En lugar de escribir "cambios" o "arreglé cosas", escribe exactamente qué hiciste: "Agregué sección de contacto a la página principal".`,
      },
      {
        key: "comandos-git",
        titulo: "Los 4 comandos que usarás siempre",
        cuerpo: `Para usar Git, abres la terminal de tu computadora y escribes comandos de texto.

Los comandos esenciales:

git init
Convierte la carpeta actual en un repositorio de Git. Solo se usa una vez al inicio.

git add .
Prepara todos los archivos modificados para ser guardados en el próximo commit. El punto "." significa "todos los archivos".

git commit -m "tu mensaje aquí"
Toma la fotografía (el commit) de los archivos que preparaste con git add. El mensaje va entre comillas.

git status
Muestra el estado actual: qué archivos han cambiado, cuáles están preparados para commit, y cuáles no.`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Tu primer repositorio y tu primer commit",
        descripcion: `Instala Git en tu computadora si no lo tienes (git-scm.com). Luego abre la terminal.

Navega hasta la carpeta donde guardaste tu página HTML de la semana pasada. Escribe estos comandos uno por uno:

git init
git add .
git commit -m "Mi primera página web personal"

Luego escribe "git log" para ver el historial. ¿Ves tu commit con el mensaje que escribiste?

Si algo no funciona, copia el mensaje de error exacto que aparece y tráelo a la próxima sesión.`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa si haces commit sin mensaje?",
        descripcion: `Modifica tu archivo index.html — agrega cualquier texto nuevo. Luego intenta hacer commit sin mensaje:

git add .
git commit

¿Qué pasó? ¿Git te dejó hacer el commit sin mensaje?

Sal de la pantalla que aparezca presionando Escape, luego escribe :q y presiona Enter.

Ahora haz el commit correctamente con un mensaje descriptivo. ¿Cuál sería un buen mensaje para describir el cambio que hiciste?`,
      },
      {
        phase: "AUDITAR",
        titulo: "Evalúa estos mensajes de commit",
        descripcion: `Mira estos mensajes de commit y evalúa cuáles son útiles y cuáles no:

1. "cambios"
2. "Agregué el párrafo de presentación y corregí el enlace de LinkedIn"
3. "asdfjkl"
4. "Arreglé el error del título"
5. "Creé la sección de hobbies con lista de 3 elementos"

Para cada uno escribe: ¿es útil? ¿Por qué sí o por qué no? ¿Qué información da sobre qué cambió?

El criterio es simple: si alguien ve ese mensaje en 6 meses sin ver el código, ¿entiende qué se cambió?`,
      },
      {
        phase: "LANZAR",
        titulo: "Historial de 3 commits",
        descripcion: `Haz al menos 3 cambios diferentes a tu página HTML. Después de cada cambio, haz un commit con un mensaje descriptivo y específico.

Al final, escribe "git log" y toma una captura de pantalla donde se vean los 3 commits con sus mensajes.

Comparte la captura en el canal del bootcamp. Asegúrate de que los mensajes sean descriptivos — no "cambios" ni "arreglé cosas".`,
      },
    ],

    quiz: {
      pregunta: `Carlos lleva una semana trabajando en su proyecto y nunca usó Git. Hoy accidentalmente borró los archivos más importantes. ¿Cuál de estas afirmaciones es correcta?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: "Git los puede recuperar automáticamente aunque no lo haya configurado antes.",
          feedback: "Git solo puede recuperar archivos de los commits que se hicieron antes de borrar. Si Carlos nunca usó Git, no hay historial guardado. No hay magia — Git solo protege lo que ya fue guardado en commits.",
        },
        {
          label: "B", esCorrecta: true,
          texto: "Los archivos están perdidos porque nunca hubo commits. Git no puede recuperar lo que nunca se guardó.",
          feedback: "Exacto. Git guarda el historial en los commits. Si Carlos nunca hizo un commit, Git no tiene nada guardado. Los archivos borrados están perdidos. Esta es exactamente la razón por la que se deben hacer commits frecuentes.",
        },
        {
          label: "C", esCorrecta: false,
          texto: "Git guarda automáticamente todo aunque no hayas hecho commits.",
          feedback: "Git no guarda nada automáticamente. Solo guarda lo que tú explícitamente le ordenas guardar con git add y git commit. Sin esos comandos, Git no hace nada.",
        },
        {
          label: "D", esCorrecta: false,
          texto: "La carpeta .git guarda copias de todos los archivos aunque no hayas hecho commits.",
          feedback: "La carpeta .git solo contiene los commits que se hicieron. Si no hay commits, la carpeta .git está casi vacía y no tiene copias de los archivos de trabajo.",
        },
      ],
    },
  });

  // ── SESIÓN 5 ─────────────────────────────────────────────
  await crearSesion(prisma, mod.id, tenantId, {
    orden: 5, semana: 2, dia: "MIERCOLES",
    sessionType: "PRACTICA", duracion: 180,
    titulo: "GitHub: tu código en la nube y visible al mundo",
    descripcion: "Crea tu cuenta en GitHub, sube tu proyecto, y entiende la diferencia entre Git (local) y GitHub (en internet).",
    video: { url: "https://www.youtube.com/watch?v=3GymExBkKjE", titulo: "GitHub para principiantes" },

    historia: `Git fue creado en 2005 para guardar código en tu computadora. Pero los desarrolladores pronto se dieron cuenta de que necesitaban algo más: un lugar en internet donde guardar ese código, compartirlo con otros, y colaborar en equipo.

En 2008, tres desarrolladores crearon GitHub — un sitio web construido alrededor de Git. GitHub es básicamente una nube para tus repositorios de Git.

Hoy GitHub tiene más de 100 millones de usuarios. Es donde vive la gran mayoría del código abierto del mundo. Si quieres trabajar en tecnología, tu perfil de GitHub es tan importante como tu hoja de vida.`,

    kaledIntro: `En la sesión anterior aprendiste Git — el sistema que guarda el historial de tu código en tu computadora. Hoy aprenderás GitHub — el lugar en internet donde ese código vive y es visible.

La diferencia es importante: Git es local (en tu computadora). GitHub es remoto (en internet). Usas Git para crear los commits, y luego subes esos commits a GitHub para tenerlos en la nube y compartirlos.

Tu perfil de GitHub va a mostrar todo lo que construyas durante el bootcamp. Al final de los 4 meses, tendrás un portafolio visible en internet con todos tus proyectos.`,

    analogia: `Git es el cuaderno donde escribes tu diario. GitHub es donde subes ese diario a la nube para que no se pierda y para que otros puedan leerlo si quieres.

Con tu cuaderno local (Git) puedes escribir en cualquier momento, sin internet. Pero si el cuaderno se pierde o se daña, perdiste todo. Al subir a GitHub, tienes una copia en la nube que no se puede perder y que puedes acceder desde cualquier computadora.

Además, puedes elegir si tu repositorio es privado (solo tú lo ves) o público (cualquier persona en el mundo puede verlo).`,

    conceptos: [
      {
        key: "github",
        titulo: "GitHub — Git en la nube",
        cuerpo: `GitHub es un sitio web que guarda tus repositorios de Git en internet.

Cuando subes tu repositorio a GitHub, tienes:
— Una copia de seguridad en la nube de todo tu código y su historial
— Una dirección web donde cualquier persona puede ver tu código (si el repo es público)
— Un portafolio profesional de todo lo que has construido

GitHub es gratuito para repositorios públicos y privados (con algunas limitaciones en privados).`,
      },
      {
        key: "remoto-local",
        titulo: "Local vs remoto — Dos copias del mismo repositorio",
        cuerpo: `Tu computadora tiene la copia local del repositorio. GitHub tiene la copia remota.

Los cambios que haces en tu computadora no llegan solos a GitHub — tienes que enviarlos tú con un comando.

git push: envía tus commits locales a GitHub
git pull: descarga los cambios de GitHub a tu computadora

Es como tener un documento en tu computadora y en Google Drive. Si editas en tu computadora, debes sincronizar para que Google Drive se actualice.`,
      },
      {
        key: "comandos-github",
        titulo: "Conectar tu repositorio con GitHub",
        cuerpo: `Para subir tu repositorio a GitHub por primera vez, sigues estos pasos:

1. Creas un repositorio nuevo en GitHub (desde la web de GitHub)
2. Conectas tu repositorio local con ese repositorio remoto:
   git remote add origin https://github.com/tu-usuario/nombre-repo.git
3. Subes tus commits:
   git push -u origin main

Después, cada vez que hagas nuevos commits, solo necesitas:
git push

Y para descargar cambios de GitHub:
git pull`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Sube tu proyecto a GitHub",
        descripcion: `Crea una cuenta gratuita en github.com si no tienes una.

Crea un nuevo repositorio en GitHub llamado "mi-pagina-personal". Elige que sea público.

Conecta tu repositorio local con GitHub y sube todos tus commits. Al final, entra a tu repositorio en GitHub desde el navegador y verifica que tus archivos están ahí.

Copia la URL de tu repositorio (se verá como: github.com/tu-usuario/mi-pagina-personal).`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa si modificas algo en GitHub directamente?",
        descripcion: `Entra a tu repositorio en GitHub. Haz clic en tu archivo index.html y luego en el ícono de lápiz para editarlo directamente en GitHub. Agrega una línea de texto y haz commit desde la web de GitHub.

Ahora, en tu computadora, intenta hacer git push sin antes hacer git pull. ¿Qué mensaje de error aparece?

Luego haz git pull para traer el cambio de GitHub a tu computadora. ¿Funcionó? ¿Qué aprendes sobre el orden correcto de las operaciones?`,
      },
      {
        phase: "AUDITAR",
        titulo: "Revisa el historial de tu repositorio en GitHub",
        descripcion: `Entra a tu repositorio en GitHub. Busca el botón que muestra el número de commits (algo como "3 commits").

Haz clic ahí y revisa cada commit. ¿Los mensajes que escribiste son descriptivos? ¿Alguien que no te conoce podría entender qué cambió en cada uno?

Si los mensajes no son suficientemente claros, escribe en tu cuaderno cómo los escribirías mejor la próxima vez.`,
      },
      {
        phase: "LANZAR",
        titulo: "Tu repositorio público en GitHub",
        descripcion: `Comparte la URL de tu repositorio de GitHub en el canal del bootcamp.

Verifica que:
— El repositorio es público (cualquiera puede verlo)
— Tiene al menos 3 commits con mensajes descriptivos
— Los archivos de tu página están visibles en GitHub

Este es el primer paso de tu portafolio profesional. Desde hoy, todo lo que construyas en el bootcamp irá a GitHub.`,
      },
    ],

    quiz: {
      pregunta: `Sofía trabaja en su proyecto en su laptop personal. También quiere poder trabajar desde el computador del trabajo. ¿Cuál es la forma correcta de usar Git y GitHub para esto?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: "Copiar los archivos en un USB y llevarlos entre computadores.",
          feedback: "Usar un USB funciona, pero pierdes el historial de Git y es inconveniente. GitHub existe exactamente para evitar esto — el repositorio en la nube es accesible desde cualquier computador.",
        },
        {
          label: "B", esCorrecta: false,
          texto: "Instalar Git solo en uno de los dos computadores.",
          feedback: "Git necesita estar instalado en cada computador donde quieras trabajar. Además, necesitas conectar cada instalación local con el repositorio de GitHub.",
        },
        {
          label: "C", esCorrecta: true,
          texto: "Hacer git push desde la laptop antes de salir, y git pull en el computador del trabajo al llegar.",
          feedback: "Exacto. GitHub actúa como el intermediario. Sofía sube sus cambios desde un computador (git push) y los descarga en otro (git pull). El repositorio en GitHub siempre tiene la versión más reciente.",
        },
        {
          label: "D", esCorrecta: false,
          texto: "GitHub sincroniza automáticamente todos los cambios sin necesidad de hacer nada.",
          feedback: "GitHub no sincroniza automáticamente. Tú controlas cuándo subir (git push) y cuándo descargar (git pull). La sincronización manual es intencional — evita subir cambios accidentales.",
        },
      ],
    },
  });

  // ── SESIÓN 6 ─────────────────────────────────────────────
  await crearSesion(prisma, mod.id, tenantId, {
    orden: 6, semana: 2, dia: "VIERNES",
    sessionType: "ENTREGABLE", duracion: 180,
    titulo: "CSS: dale estilo y color a tu página",
    descripcion: "Aprende CSS para controlar el aspecto visual de tu página: colores, tipografía, tamaños y el modelo de caja.",
    video: { url: "https://www.youtube.com/watch?v=G3e-cpL7ofc", titulo: "CSS desde cero — Todo lo que necesitas saber" },

    historia: `Cuando se creó HTML en 1991, los desarrolladores mezclaban el contenido y el diseño en el mismo archivo. Si querías un texto rojo, escribías la instrucción del color dentro de la misma etiqueta del texto. Era un caos.

En 1996, el W3C (la organización que define los estándares de la web) publicó CSS — Cascading Style Sheets. La idea era separar completamente el contenido (HTML) del diseño visual (CSS).

Con CSS, podías escribir en un archivo separado todas las instrucciones de diseño: este tipo de texto es azul, estos títulos tienen ese tamaño, estas secciones tienen ese fondo. Un solo archivo CSS podía controlar el aspecto de cientos de páginas HTML.`,

    kaledIntro: `Hasta ahora tu página tiene estructura pero es bastante simple visualmente — texto negro sobre fondo blanco, sin colores ni diseño.

CSS es lo que le da vida visual a las páginas web. Colores, tipografía, espaciado, fondos, bordes — todo eso es CSS.

Lo más importante de CSS es el concepto de "cascada" — el nombre viene de ahí. Las reglas CSS se aplican en cascada: si varias reglas aplican a un mismo elemento, hay un orden de prioridad para decidir cuál gana. Hoy aprenderás esa lógica.`,

    analogia: `HTML es el esqueleto de tu página. CSS es la ropa y el maquillaje.

El mismo esqueleto (la misma estructura HTML) puede verse completamente diferente con distintos estilos CSS. Es como la misma persona vestida para ir a la playa, a una entrevista de trabajo, o a una fiesta — es la misma persona pero con apariencias completamente diferentes.

Por eso separamos HTML y CSS: la estructura no cambia, pero el diseño puede cambiar sin tocar el contenido.`,

    conceptos: [
      {
        key: "css-sintaxis",
        titulo: "Sintaxis CSS — Cómo escribir las reglas",
        cuerpo: `Una regla CSS tiene tres partes:

selector {
  propiedad: valor;
}

— El selector indica a qué elementos HTML aplica la regla
— La propiedad indica qué aspecto vas a cambiar
— El valor indica a qué lo vas a cambiar

Por ejemplo:
h1 {
  color: blue;
  font-size: 32px;
}

Esto le dice al navegador: "todos los h1 de la página deben tener color azul y tamaño de 32 píxeles".`,
      },
      {
        key: "selectores",
        titulo: "Selectores — A quién le aplica el estilo",
        cuerpo: `El selector le dice al navegador a qué elementos HTML aplica una regla CSS.

Los selectores más básicos:

Por etiqueta: selecciona todos los elementos de ese tipo
p { color: gray; }
(todos los párrafos serán grises)

Por clase: selecciona elementos que tienen un atributo class específico
.destacado { color: red; }
(elementos con class="destacado" serán rojos)

Por ID: selecciona el elemento con ese atributo id único
#titulo-principal { font-size: 40px; }
(el elemento con id="titulo-principal" tendrá ese tamaño)

La clase es la más usada porque puede aplicarse a múltiples elementos, mientras que el ID debe ser único en la página.`,
      },
      {
        key: "box-model",
        titulo: "El modelo de caja — Cómo ocupa espacio cada elemento",
        cuerpo: `En CSS, cada elemento HTML es una caja rectangular. Esa caja tiene cuatro capas:

Content (contenido): el texto o la imagen dentro del elemento

Padding: espacio transparente entre el contenido y el borde. Hace que el contenido no quede pegado al borde.

Border: el borde visible (si lo hay) que rodea el padding y el contenido.

Margin: espacio transparente fuera del borde. Separa este elemento de los elementos vecinos.

Entender el modelo de caja es fundamental para controlar el espaciado y la distribución de los elementos en la página.`,
      },
      {
        key: "vincular-css",
        titulo: "Cómo vincular CSS con HTML",
        cuerpo: `Hay tres formas de agregar CSS a tu página HTML:

1. Archivo externo (la mejor práctica):
Creas un archivo separado llamado "estilos.css" y lo vinculas en el head de tu HTML:
<link rel="stylesheet" href="estilos.css">

2. Dentro del head (inline en el archivo):
<style>
  h1 { color: blue; }
</style>

3. Directamente en la etiqueta (evitar en lo posible):
<h1 style="color: blue;">Título</h1>

La primera opción es la recomendada porque mantiene el CSS separado del HTML y permite que un solo archivo CSS estilice múltiples páginas HTML.`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Dale estilo a tu página personal",
        descripcion: `Crea un archivo nuevo llamado "estilos.css" en la misma carpeta que tu "index.html". Vincúlalo en el head de tu HTML con la etiqueta link.

Agrega estos estilos mínimos:
— Un color de fondo para la página (body)
— Un color diferente para los títulos (h1, h2)
— Un tamaño y color de letra para los párrafos (p)
— Un color para los enlaces (a)
— Algún padding o margin para que el contenido no quede pegado al borde

Guarda, recarga en el navegador, y ve cómo cambia la apariencia.`,
      },
      {
        phase: "ROMPER",
        titulo: "Conflicto de estilos — ¿Cuál gana?",
        descripcion: `Agrega este estilo en tu archivo CSS:
p { color: blue; }

Luego, en la misma etiqueta de un párrafo específico en tu HTML, agrega:
<p style="color: red;">Este párrafo tiene color en línea</p>

¿Qué color tiene ese párrafo? ¿Azul (del CSS externo) o rojo (del estilo en línea)?

Ahora agrega otra regla en el CSS:
p { color: green !important; }

¿Qué pasó? Escribe en tu cuaderno las conclusiones sobre qué tiene más prioridad.`,
      },
      {
        phase: "AUDITAR",
        titulo: "Usa las DevTools para inspeccionar estilos",
        descripcion: `Abre tu página en el navegador. Haz clic derecho sobre cualquier elemento y selecciona "Inspeccionar".

En el panel que aparece, selecciona diferentes elementos de tu página. En el panel de la derecha verás todos los estilos CSS que aplican a ese elemento.

Observa:
— ¿Hay estilos que están tachados (cancelados)?
— ¿Por qué algunos estilos se cancelan?
— ¿Puedes modificar un estilo directamente en las DevTools? (Los cambios son temporales — se pierden al recargar)

Escribe qué aprendiste sobre cómo el navegador aplica los estilos.`,
      },
      {
        phase: "LANZAR",
        titulo: "Entregable semana 2: página con estilos",
        descripcion: `Tu página "index.html" ahora debe tener estilos CSS en un archivo separado "estilos.css".

Haz commit de los cambios con un mensaje descriptivo y sube a GitHub (git push).

Verifica que en tu repositorio de GitHub aparecen dos archivos: index.html y estilos.css.

La página debe verse visualmente diferente a texto negro sobre fondo blanco — con al menos colores, tamaños de letra, y algún espaciado definido por ti.`,
      },
    ],

    quiz: {
      pregunta: `Diego tiene una regla CSS que dice "p { color: blue; }" pero uno de sus párrafos sigue siendo negro. ¿Cuál es la causa más probable?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: "CSS no puede cambiar el color del texto, solo el color de fondo.",
          feedback: "CSS sí puede cambiar el color del texto con la propiedad color. Es una de las propiedades más básicas de CSS.",
        },
        {
          label: "B", esCorrecta: false,
          texto: "El navegador de Diego no soporta CSS.",
          feedback: "Todos los navegadores modernos soportan CSS desde hace más de 20 años. Si el CSS no está funcionando, el problema es en el código, no en el navegador.",
        },
        {
          label: "C", esCorrecta: true,
          texto: "El archivo CSS no está correctamente vinculado con el HTML, o ese párrafo específico tiene un estilo en línea que tiene mayor prioridad.",
          feedback: "¡Correcto! Hay dos causas comunes: (1) el archivo CSS no está vinculado con la etiqueta link en el head del HTML, o (2) ese párrafo tiene un atributo style directamente en la etiqueta que tiene mayor prioridad que el CSS externo. Las DevTools ayudan a diagnosticar cuál es el caso.",
        },
        {
          label: "D", esCorrecta: false,
          texto: "La propiedad correcta es font-color, no color.",
          feedback: "La propiedad correcta para el color del texto en CSS es color (sin prefijo). No existe font-color en CSS estándar.",
        },
      ],
    },

    entregable: {
      titulo: "Página personal con HTML y CSS",
      descripcion: "Tu página de presentación personal ahora con estilos CSS en archivo separado. Subida a GitHub con commits descriptivos.",
      esFinal: false,
      items: [
        "El archivo estilos.css existe en la misma carpeta que index.html",
        "El CSS está vinculado correctamente con la etiqueta link en el head del HTML",
        "La página tiene colores definidos (fondo, texto, títulos)",
        "Los párrafos tienen un tamaño de letra legible definido en CSS",
        "Los elementos tienen padding o margin que mejoran la legibilidad",
        "Los archivos están subidos a GitHub con git push",
        "El repositorio de GitHub muestra los dos archivos: index.html y estilos.css",
      ],
    },
  });

  console.log(`     ✓ Módulo 1 Semanas 1-2: 6 sesiones con contenido completo`);
  await seedModulo1Semanas3y4(prisma, mod.id, tenantId);
}

async function seedModulo1Semanas3y4(prisma: PrismaClient, moduleId: string, tenantId: string) {
  // ── SESIÓN 7 ─────────────────────────────────────────────
  await crearSesion(prisma, moduleId, tenantId, {
    orden: 7, semana: 3, dia: "LUNES",
    sessionType: "PRACTICA", duracion: 180,
    titulo: "CSS Layout: Flexbox para organizar contenido",
    descripcion: "Aprende a organizar elementos en filas y columnas con Flexbox, el sistema de layout más usado en la web actual.",
    video: { url: "https://www.youtube.com/watch?v=phWxA89Dy94", titulo: "Flexbox CSS — La guía completa en español" },

    historia: `Durante los primeros años de CSS, organizar elementos en la página era un dolor de cabeza. Los desarrolladores usaban tablas (pensadas para datos) para hacer layouts, o flotaban elementos de formas complicadas que producían errores difíciles de depurar.

En 2009, el W3C propuso Flexbox — un sistema de layout diseñado específicamente para organizar elementos en una dimensión (fila o columna). Se estandarizó completamente en 2015.

Flexbox simplificó algo que antes era complicadísimo: centrar un elemento vertical y horizontalmente en la pantalla. Con Flexbox se hace en dos líneas.`,

    kaledIntro: `Hasta ahora has colocado elementos uno encima del otro — eso es el comportamiento normal de HTML. Pero en la mayoría de páginas web los elementos se organizan en filas y columnas.

El menú de navegación de una página está en fila horizontal. Las tarjetas de productos están en una cuadrícula. El header tiene el logo a la izquierda y el menú a la derecha.

Flexbox es el sistema que te permite hacer eso. Es el layout más usado en la web hoy, y es lo que usarás para organizar tu página personal de forma profesional.`,

    analogia: `Flexbox es como organizar libros en un estante.

Puedes ponerlos todos en fila horizontal (flex-direction: row). O apilarlos verticalmente (flex-direction: column). Puedes centrarlos todos en el medio del estante (justify-content: center). Puedes espaciarlos uniformemente (justify-content: space-between).

El contenedor del estante controla cómo se organizan los libros adentro. En Flexbox, el elemento padre (el estante) controla cómo se posicionan sus hijos (los libros).`,

    conceptos: [
      {
        key: "flex-container",
        titulo: "El contenedor flex — Quién controla",
        cuerpo: `Flexbox funciona con dos actores: el contenedor (el padre) y los elementos (los hijos).

Para activar Flexbox, solo necesitas agregar una propiedad CSS al contenedor:
.contenedor {
  display: flex;
}

Con esa sola línea, todos los hijos directos de ese contenedor se organizan en fila horizontal automáticamente.

El contenedor tiene las propiedades que controlan la organización:
— flex-direction: fila (row) o columna (column)
— justify-content: cómo distribuir en el eje principal
— align-items: cómo alinear en el eje secundario
— gap: espacio entre los elementos`,
      },
      {
        key: "justify-align",
        titulo: "Distribuir y alinear elementos",
        cuerpo: `Las dos propiedades más importantes del contenedor flex:

justify-content controla la distribución en el eje principal (horizontal si es row, vertical si es column):
— flex-start: elementos al inicio
— flex-end: elementos al final
— center: elementos centrados
— space-between: espacio igual entre elementos, sin espacio en los bordes
— space-around: espacio igual alrededor de cada elemento

align-items controla la alineación en el eje secundario (vertical si es row):
— flex-start: elementos al inicio
— flex-end: elementos al final
— center: elementos centrados verticalmente
— stretch: los elementos se estiran para llenar el espacio (default)`,
      },
      {
        key: "flex-wrap",
        titulo: "Wrap — Qué pasa cuando no caben todos",
        cuerpo: `Por defecto, Flexbox intenta meter todos los elementos en una sola fila o columna, aunque no quepan — los encoge.

Para que los elementos pasen a la siguiente línea cuando no quepan, usas:
.contenedor {
  flex-wrap: wrap;
}

Esto es especialmente útil para diseños responsivos — cuando la pantalla es pequeña (celular), los elementos que no caben en la fila pasan automáticamente a la siguiente.`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Reorganiza tu página con Flexbox",
        descripcion: `En tu página personal, identifica secciones que podrían beneficiarse de Flexbox:

1. Si tienes un header con nombre y navegación, ponlos en fila con Flexbox y espácialos con space-between.

2. Crea una sección de "habilidades" o "intereses" con 3 tarjetas (divs) y organízalas en fila con Flexbox y gap entre ellas.

Para cada uno, agrega display: flex al contenedor y experimenta con justify-content y align-items hasta que se vea como quieres.`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa cuando la ventana es muy estrecha?",
        descripcion: `Con tu página abierta en el navegador, abre las DevTools (F12) y activa el modo de dispositivo móvil (el ícono de celular arriba en las DevTools).

Cambia el ancho a 375px (tamaño de iPhone). ¿Cómo se ven tus elementos Flexbox? ¿Siguen en fila o se desbordaron?

Agrega flex-wrap: wrap al contenedor y prueba de nuevo. ¿Qué diferencia ves?

Escribe en tu cuaderno qué aprendiste sobre diseño para pantallas pequeñas.`,
      },
      {
        phase: "AUDITAR",
        titulo: "Inspecciona Flexbox en una página real",
        descripcion: `Entra a cualquier sitio web que uses frecuentemente. Abre las DevTools y haz clic en diferentes secciones de la página.

En el panel de estilos, busca elementos que tengan "display: flex". ¿Los encuentras? Observa qué propiedades de Flexbox usan.

Compara con lo que tú construiste. ¿Usan las mismas propiedades? ¿Hay propiedades que ves ahí que todavía no conoces?`,
      },
      {
        phase: "LANZAR",
        titulo: "Página con layout Flexbox en GitHub",
        descripcion: `Tu página debe tener al menos dos usos de Flexbox: uno para organizar el header o la navegación, y otro para organizar una sección de contenido.

Haz commit y push a GitHub. Verifica que la página se ve correctamente en el navegador.

Comparte la URL de tu repositorio en el canal del bootcamp con una captura de pantalla de cómo se ve la página ahora.`,
      },
    ],

    quiz: {
      pregunta: `Ana tiene un contenedor con tres tarjetas dentro. Quiere que las tres estén en fila horizontal con espacio igual entre ellas pero sin espacio extra en los bordes. ¿Qué propiedades necesita?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: "display: flex; align-items: space-between;",
          feedback: "El error está en usar align-items para este caso. align-items controla la alineación en el eje secundario (vertical cuando es fila). Para distribuir horizontalmente, la propiedad correcta es justify-content.",
        },
        {
          label: "B", esCorrecta: true,
          texto: "display: flex; justify-content: space-between;",
          feedback: "¡Correcto! display: flex activa Flexbox en el contenedor. justify-content: space-between distribuye los elementos en el eje principal (horizontal en una fila) con espacio igual entre ellos pero sin espacio en los bordes.",
        },
        {
          label: "C", esCorrecta: false,
          texto: "flex-direction: row; justify-content: space-around;",
          feedback: "Casi. flex-direction: row es el valor por defecto y no es necesario escribirlo. Pero el problema principal es space-around — ese sí pone espacio en los bordes (la mitad del espacio entre elementos). Para sin espacio en los bordes, el valor correcto es space-between. Además, falta display: flex.",
        },
        {
          label: "D", esCorrecta: false,
          texto: "display: flex; flex-wrap: wrap;",
          feedback: "flex-wrap: wrap controla qué pasa cuando los elementos no caben y pasan a la siguiente línea. No controla cómo se distribuyen los elementos en la fila.",
        },
      ],
    },
  });

  // ── SESIÓN 8 ─────────────────────────────────────────────
  await crearSesion(prisma, moduleId, tenantId, {
    orden: 8, semana: 3, dia: "MIERCOLES",
    sessionType: "PRACTICA", duracion: 180,
    titulo: "Diseño responsivo: tu página en todos los tamaños",
    descripcion: "Aprende a hacer que tu página se vea bien en celulares, tablets y computadores con media queries y unidades relativas.",
    video: { url: "https://www.youtube.com/watch?v=bn-DQznFMFU", titulo: "Diseño responsivo con CSS — Media queries" },

    historia: `En 2010, el diseñador web Ethan Marcotte publicó un artículo que cambió la industria: "Responsive Web Design". En ese momento, los sitios web se diseñaban para pantallas de escritorio — si las abrías en un celular, tenías que hacer zoom y desplazarte horizontalmente para leer.

Marcotte propuso un enfoque diferente: un mismo sitio que se adapta automáticamente al tamaño de la pantalla del dispositivo que lo está viendo. La misma URL, el mismo código HTML, pero con estilos CSS que cambian según el tamaño de la pantalla.

Hoy, más del 60% del tráfico web mundial viene de dispositivos móviles. Un sitio web que no funciona en celular perdió más de la mitad de sus visitantes.`,

    kaledIntro: `Hasta ahora tu página se ve bien en el computador donde la estás construyendo. Pero si la abres en un celular, probablemente no se ve igual de bien.

Diseño responsivo significa que tu página se adapta automáticamente al tamaño de la pantalla. No necesitas crear dos versiones del sitio — el mismo código CSS se comporta diferente según el ancho de la pantalla.

Esto se logra con media queries — reglas CSS que solo aplican cuando la pantalla cumple ciertas condiciones de tamaño.`,

    analogia: `Una media query es como un conjunto de ropa que se adapta automáticamente.

Imagina una chaqueta que, cuando hace frío (pantalla pequeña), se cierra sola y se hace más compacta. Cuando hace calor (pantalla grande), se abre y se distribuye con más espacio.

Tu página es esa chaqueta. Las media queries son las reglas que le dicen cómo comportarse según las condiciones (el tamaño de pantalla).`,

    conceptos: [
      {
        key: "media-queries",
        titulo: "Media queries — Reglas condicionales de CSS",
        cuerpo: `Una media query es un bloque de CSS que solo aplica cuando se cumple una condición de tamaño de pantalla.

La sintaxis:
@media (max-width: 768px) {
  /* estas reglas solo aplican cuando la pantalla tiene 768px o menos */
  .columnas {
    flex-direction: column;
  }
}

Con max-width defines el ancho máximo donde aplica. Con min-width defines el ancho mínimo.

Los breakpoints más comunes:
— 576px: pantallas pequeñas (teléfonos en vertical)
— 768px: tablets
— 992px: pantallas medianas
— 1200px: pantallas grandes`,
      },
      {
        key: "unidades-relativas",
        titulo: "Unidades relativas — Tamaños que se adaptan",
        cuerpo: `En lugar de definir tamaños fijos en píxeles (que no se adaptan), puedes usar unidades relativas:

% (porcentaje): relativo al elemento padre
.caja { width: 50%; } /* ocupa la mitad del ancho del padre */

vw y vh: relativo al ancho o alto de la ventana del navegador
.hero { height: 100vh; } /* tan alto como la ventana entera */

em: relativo al tamaño de letra del elemento padre
.texto { font-size: 1.2em; } /* 20% más grande que el padre */

rem: relativo al tamaño de letra raíz del documento
.titulo { font-size: 2rem; } /* el doble del tamaño base */

Combinar unidades relativas con media queries es la base del diseño responsivo.`,
      },
      {
        key: "mobile-first",
        titulo: "Mobile first — Diseña para celular primero",
        cuerpo: `El enfoque "mobile first" significa escribir primero los estilos para pantallas pequeñas, y luego agregar media queries para pantallas más grandes.

Es más fácil ampliar un diseño simple que reducir un diseño complejo. Además, como la mayoría del tráfico viene de celulares, es más importante que se vea bien en celular.

Con mobile first:
/* Estilos base — para celular */
.columnas {
  flex-direction: column;
}

/* Media query — pantallas más grandes */
@media (min-width: 768px) {
  .columnas {
    flex-direction: row;
  }
}`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Haz tu página responsiva",
        descripcion: `Abre tu página en el simulador de móvil de las DevTools (F12 → ícono de celular). Observa qué se ve mal en pantalla pequeña.

Agrega una media query en tu CSS para pantallas de 600px o menos:

@media (max-width: 600px) {
  /* aquí corriges lo que se ve mal en celular */
}

Por ejemplo: si tienes elementos en fila que en celular deberían ir en columna, cambia flex-direction dentro de la media query. Experimenta hasta que la versión de celular se vea bien.`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa sin el meta viewport?",
        descripcion: `En tu archivo HTML, busca en el head esta línea:
<meta name="viewport" content="width=device-width, initial-scale=1">

Si no la tienes, agrégala. Si ya la tienes, elimínala temporalmente.

Abre tu página en el simulador de móvil con y sin esa línea. ¿Qué diferencia ves?

Vuelve a agregar la línea. ¿Por qué crees que esa línea es tan importante para el diseño responsivo?`,
      },
      {
        phase: "AUDITAR",
        titulo: "Prueba en múltiples tamaños",
        descripcion: `Abre tu página en el simulador de móvil. Prueba los siguientes anchos:
— 375px (iPhone)
— 768px (tablet)
— 1280px (laptop)

Para cada ancho, evalúa:
— ¿El texto es legible sin hacer zoom?
— ¿Los elementos se superponen o se salen de la pantalla?
— ¿Los botones y enlaces son fáciles de tocar con el dedo?

Escribe los problemas que encuentres y cómo los solucionarías.`,
      },
      {
        phase: "LANZAR",
        titulo: "Página responsiva en GitHub",
        descripcion: `Tu página debe verse correctamente tanto en escritorio como en celular.

Haz commit y push a GitHub. Comparte dos capturas de pantalla en el canal: una de la versión de escritorio y otra de la versión de celular en el simulador.

Si tienes un celular, abre tu repositorio de GitHub en él (la URL del archivo raw) y verifica que funcione en un dispositivo real.`,
      },
    ],

    quiz: {
      pregunta: `Tomás quiere que su menú de navegación muestre los enlaces en fila en computador, pero en columna en celular. ¿Cuál es la estructura correcta de CSS?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: ".nav { flex-direction: column; } @media (min-width: 768px) { .nav { flex-direction: row; } }",
          feedback: "¡Esta respuesta también es correcta! Es el enfoque mobile first: primero defines el estilo para celular (column) y luego para pantallas más grandes (row). Ambas opciones A y B son válidas — depende de si prefieres mobile first o desktop first.",
        },
        {
          label: "B", esCorrecta: true,
          texto: ".nav { flex-direction: row; } @media (max-width: 768px) { .nav { flex-direction: column; } }",
          feedback: "¡Correcto! Esta es la versión desktop first: defines el estilo para escritorio (row) y la media query con max-width cambia el comportamiento en pantallas pequeñas (column). Es una solución válida y muy común.",
        },
        {
          label: "C", esCorrecta: false,
          texto: "@media (celular) { .nav { flex-direction: column; } }",
          feedback: '"celular" no es una condición válida de media query. Las media queries usan condiciones como max-width o min-width con valores en píxeles.',
        },
        {
          label: "D", esCorrecta: false,
          texto: ".nav-celular { flex-direction: column; } .nav-escritorio { flex-direction: row; }",
          feedback: "Este enfoque crearía dos clases separadas que habría que cambiar manualmente según el dispositivo. Las media queries hacen este cambio automáticamente según el ancho real de la pantalla, sin necesidad de dos clases diferentes.",
        },
      ],
    },
  });

  // ── SESIÓN 9 ─────────────────────────────────────────────
  await crearSesion(prisma, moduleId, tenantId, {
    orden: 9, semana: 3, dia: "VIERNES",
    sessionType: "ENTREGABLE", duracion: 180,
    titulo: "JavaScript: la lógica que hace tu página interactiva",
    descripcion: "Aprende los fundamentos de JavaScript: variables, tipos de datos, condicionales y funciones. Haz que tu página responda a las acciones del usuario.",
    video: { url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", titulo: "JavaScript desde cero" },

    historia: `En 1995, Brendan Eich creó JavaScript en solo 10 días para el navegador Netscape. El objetivo era simple: hacer que las páginas web pudieran responder a las acciones del usuario sin necesidad de recargar la página.

Antes de JavaScript, si llenabas un formulario en internet y lo enviabas con un error, la página se recargaba por completo y tenías que escribir todo de nuevo. Con JavaScript, la página puede revisar el formulario antes de enviarlo y mostrarte el error al instante.

Hoy JavaScript es el lenguaje de programación más usado en el mundo. Funciona en navegadores, en servidores, en aplicaciones de escritorio, y en dispositivos móviles.`,

    kaledIntro: `HTML define la estructura de tu página. CSS define cómo se ve. JavaScript define cómo se comporta.

Con JavaScript, tu página puede hacer cosas: cuando alguien hace clic en un botón, algo cambia. Cuando alguien pasa el cursor sobre una imagen, aparece algo. Cuando alguien escribe en un campo, la página responde.

JavaScript es el primer lenguaje de programación real que aprenderás en este bootcamp. Tiene sus propias reglas, su propia lógica, y su propia forma de pensar. No es difícil — solo requiere práctica y paciencia.`,

    analogia: `HTML es el edificio (la estructura). CSS es la decoración y el diseño del edificio. JavaScript es la electricidad y la plomería — lo que hace que el edificio funcione.

Sin electricidad, el edificio se ve bien pero los ascensores no funcionan, las luces no encienden, el aire acondicionado no enfría. Sin JavaScript, la página se ve bien pero no interactúa con el usuario.`,

    conceptos: [
      {
        key: "variables",
        titulo: "Variables — Guardar información",
        cuerpo: `Una variable es un nombre que le damos a un dato para poder usarlo más tarde.

En JavaScript moderno se declaran con let o const:

let nombre = "Carlos";
const edad = 25;

let se usa cuando el valor puede cambiar durante el programa.
const se usa cuando el valor no va a cambiar.

Por ejemplo:
let puntuacion = 0;  // empieza en 0
puntuacion = puntuacion + 10;  // ahora es 10

const PI = 3.14159;  // esto no va a cambiar nunca

Evita usar var — es una forma antigua de declarar variables con comportamientos confusos. Usa siempre let o const.`,
      },
      {
        key: "tipos-datos",
        titulo: "Tipos de datos — Qué clase de información puede guardar JavaScript",
        cuerpo: `JavaScript maneja diferentes tipos de datos:

String (texto): va entre comillas
let saludo = "Hola, mundo";
let nombre = 'María';

Number (número): sin comillas, puede tener decimales
let edad = 25;
let precio = 99.99;

Boolean (verdadero o falso): solo dos valores posibles
let estaActivo = true;
let estaCerrado = false;

Array (lista de valores): entre corchetes, separados por comas
let colores = ["rojo", "verde", "azul"];
let numeros = [1, 2, 3, 4, 5];

Object (objeto con propiedades): entre llaves, pares clave-valor
let persona = {
  nombre: "Luis",
  edad: 30,
  ciudad: "Montería"
};`,
      },
      {
        key: "condicionales",
        titulo: "Condicionales — Tomar decisiones",
        cuerpo: `Los condicionales permiten que el código haga cosas diferentes según las circunstancias.

La estructura básica:
if (condición) {
  // esto se ejecuta si la condición es verdadera
} else {
  // esto se ejecuta si la condición es falsa
}

Por ejemplo:
let temperatura = 30;

if (temperatura > 25) {
  console.log("Hace calor");
} else {
  console.log("Está fresco");
}

Los operadores de comparación:
=== igual a (exactamente igual)
!== diferente de
> mayor que
< menor que
>= mayor o igual
<= menor o igual`,
      },
      {
        key: "funciones",
        titulo: "Funciones — Código reutilizable",
        cuerpo: `Una función es un bloque de código que puedes nombrar y ejecutar cuando quieras, las veces que necesites.

function saludar(nombre) {
  return "Hola, " + nombre + "!";
}

let mensaje = saludar("María");  // mensaje = "Hola, María!"
let otro = saludar("Carlos");    // otro = "Hola, Carlos!"

Las funciones tienen:
— Un nombre (saludar)
— Parámetros: datos que recibe (nombre)
— Cuerpo: el código que ejecuta
— Un valor de retorno (return): el resultado que devuelve

Sin funciones, tendrías que copiar el mismo código cada vez que lo necesitas. Las funciones te permiten escribirlo una vez y usarlo muchas veces.`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Tu primer script JavaScript",
        descripcion: `Crea un archivo llamado "script.js" en tu carpeta. Vincúlalo en tu HTML antes de cerrar el body:
<script src="script.js"></script>

En el archivo script.js, escribe:

let nombre = "tu nombre aquí";
let edad = tu edad aquí;

if (edad >= 18) {
  console.log(nombre + " es mayor de edad");
} else {
  console.log(nombre + " es menor de edad");
}

Abre tu página en el navegador, abre las DevTools (F12) y ve a la pestaña "Console". ¿Qué mensaje aparece? ¿Por qué?`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa con tipos de datos incorrectos?",
        descripcion: `En tu script.js, intenta esto:

let numero = "5";  // esto es un string, no un número
let resultado = numero + 3;
console.log(resultado);

¿Qué resultado esperas? ¿Qué resultado obtienes? ¿Por qué?

Ahora intenta:
let correcto = 5;  // esto sí es un número
let resultado2 = correcto + 3;
console.log(resultado2);

¿Cuál es la diferencia? Escribe en tu cuaderno qué aprendiste sobre los tipos de datos en JavaScript.`,
      },
      {
        phase: "AUDITAR",
        titulo: "Lee errores en la consola",
        descripcion: `Abre las DevTools en la pestaña Console. Escribe intencionalmente este código incorrecto en tu script.js:

consola.log("hola");  // consola no existe, es console

Guarda y recarga la página. ¿Qué mensaje de error aparece en la consola? ¿Te dice en qué línea está el error?

Practica leer ese mensaje de error. Los mensajes de error de JavaScript siempre te dicen qué salió mal y en qué parte del código. Aprender a leerlos es una de las habilidades más importantes.`,
      },
      {
        phase: "LANZAR",
        titulo: "Entregable semana 3: página con JavaScript",
        descripcion: `Tu página debe tener ahora tres archivos: index.html, estilos.css, y script.js.

El script.js debe tener al menos:
— Una variable let o const
— Un condicional if/else
— Un console.log que muestre algo en la consola

Haz commit de los tres archivos y push a GitHub. Comparte la URL del repositorio en el canal del bootcamp.`,
      },
    ],

    quiz: {
      pregunta: `Paula escribe este código en JavaScript: let resultado = "10" + 5; ¿Cuál es el valor de resultado?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: "15 — JavaScript suma los dos números.",
          feedback: 'JavaScript ve "10" como texto (string) porque está entre comillas. Cuando sumas texto y un número, JavaScript convierte el número a texto y los concatena.',
        },
        {
          label: "B", esCorrecta: true,
          texto: '"105" — JavaScript concatena el texto "10" con el número 5 convirtiéndolo a texto.',
          feedback: 'Correcto. El operador + con un string hace concatenación. "10" + 5 resulta en el string "105". Para sumar correctamente habría que usar el número 10 sin comillas: let resultado = 10 + 5; que daría 15.',
        },
        {
          label: "C", esCorrecta: false,
          texto: "Un error — no se puede sumar texto y números.",
          feedback: 'JavaScript no lanza un error en este caso. Lo que hace es convertir el número 5 a texto "5" y concatenarlo con "10", resultando en "105".',
        },
        {
          label: "D", esCorrecta: false,
          texto: "undefined — JavaScript no sabe qué hacer con tipos mixtos.",
          feedback: 'JavaScript sí sabe qué hacer: convierte el número a texto y los concatena. El resultado es "105" como string, no undefined.',
        },
      ],
    },

    entregable: {
      titulo: "Página personal con HTML, CSS y JavaScript",
      descripcion: "Tu página de presentación con los tres archivos funcionando juntos y subida a GitHub.",
      esFinal: false,
      items: [
        "Existen tres archivos: index.html, estilos.css, y script.js",
        "El script.js está vinculado correctamente al final del body en index.html",
        "El script.js tiene al menos una variable declarada con let o const",
        "El script.js tiene al menos un condicional if/else",
        "Abriendo la consola del navegador (F12) se ve al menos un mensaje de console.log",
        "Los tres archivos están subidos a GitHub con commits descriptivos",
        "Puedes explicar qué hace cada línea de tu script.js",
      ],
    },
  });

  // ── SESIONES 10, 11, 12 — Semana 4: JavaScript avanzado ─
  await crearSesion(prisma, moduleId, tenantId, {
    orden: 10, semana: 4, dia: "LUNES",
    sessionType: "PRACTICA", duracion: 180,
    titulo: "El DOM: conecta JavaScript con tu página HTML",
    descripcion: "Aprende a seleccionar elementos de tu página con JavaScript y cambiarlos dinámicamente cuando el usuario interactúa.",
    video: { url: "https://www.youtube.com/watch?v=0ik6X4DJKCc", titulo: "DOM y eventos en JavaScript" },

    historia: `Cuando un navegador carga una página HTML, no solo la muestra en pantalla — también crea en memoria una representación interna de todos los elementos de la página. A esa representación se le llama DOM: Document Object Model.

El DOM fue estandarizado en 1998 por el W3C. Antes de eso, cada navegador tenía su propia forma de que JavaScript interactuara con la página, y el mismo código funcionaba diferente en Internet Explorer que en Netscape.

Con el DOM estándar, JavaScript puede seleccionar cualquier elemento de la página, leer su contenido, cambiar su texto, modificar sus estilos, y responder cuando el usuario hace clic o escribe.`,

    kaledIntro: `En la sesión anterior aprendiste JavaScript de forma aislada — variables, condicionales, funciones. Hoy lo conectas con tu página HTML.

El DOM es el puente entre JavaScript y HTML. Con él puedes seleccionar un elemento de tu página (un párrafo, un botón, una imagen) y modificarlo con JavaScript: cambiar su texto, cambiar su color, hacerlo aparecer o desaparecer.

Este es el momento donde JavaScript cobra vida visible — no solo en la consola, sino en la página que el usuario ve.`,

    analogia: `El DOM es como el organigrama de una empresa.

Cada empleado tiene un cargo (el tipo de elemento HTML), un nombre (el id o class), y está en una posición específica dentro de la jerarquía (el árbol de elementos).

JavaScript es el director que puede hablar con cualquier empleado: "oye, tú, el del cargo 'párrafo' con el nombre 'descripcion', cambia lo que dices por este nuevo texto". El DOM es el directorio que le dice al director dónde encontrar a cada empleado.`,

    conceptos: [
      {
        key: "seleccionar-elementos",
        titulo: "Seleccionar elementos del DOM",
        cuerpo: `Para modificar un elemento con JavaScript, primero debes seleccionarlo. Los métodos más usados:

document.getElementById("mi-id")
Selecciona el elemento que tiene ese id. Solo debe existir uno por página.

document.querySelector(".mi-clase")
Selecciona el primer elemento que coincide con ese selector CSS.

document.querySelectorAll(".mi-clase")
Selecciona todos los elementos que coinciden. Devuelve una lista.

Por ejemplo:
let titulo = document.getElementById("titulo-principal");
let parrafos = document.querySelectorAll("p");

Una vez seleccionado, puedes leer y modificar el elemento.`,
      },
      {
        key: "modificar-elementos",
        titulo: "Modificar elementos — Cambiar texto, estilos y atributos",
        cuerpo: `Una vez que tienes el elemento seleccionado, puedes modificarlo:

Cambiar el texto:
elemento.textContent = "Nuevo texto";

Cambiar estilos CSS:
elemento.style.color = "blue";
elemento.style.fontSize = "24px";

Agregar o quitar clases CSS:
elemento.classList.add("activo");
elemento.classList.remove("inactivo");
elemento.classList.toggle("visible");

Cambiar atributos HTML:
elemento.setAttribute("href", "https://nuevo-enlace.com");
let valor = elemento.getAttribute("src");`,
      },
      {
        key: "eventos",
        titulo: "Eventos — Responder a acciones del usuario",
        cuerpo: `Un evento es algo que le pasa a un elemento: el usuario hace clic, pasa el cursor encima, escribe en un campo, sube la página.

Para responder a un evento, usas addEventListener:

let boton = document.querySelector("#mi-boton");
boton.addEventListener("click", function() {
  // este código se ejecuta cuando el usuario hace clic
  console.log("¡El usuario hizo clic!");
});

Los eventos más comunes:
— click: cuando hace clic
— mouseover: cuando pasa el cursor encima
— keydown: cuando presiona una tecla
— change: cuando cambia el valor de un input
— submit: cuando envía un formulario`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Botón que cambia el texto",
        descripcion: `En tu index.html, agrega un botón y un párrafo con ids:
<p id="mensaje">Texto original</p>
<button id="mi-boton">Hacer clic aquí</button>

En tu script.js, escribe el código para que cuando el usuario haga clic en el botón, el texto del párrafo cambie a "¡El texto cambió!".

Usa getElementById para seleccionar los elementos y addEventListener para el evento click.

Prueba que funciona en el navegador.`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa si el elemento no existe?",
        descripcion: `En tu script.js, intenta seleccionar un elemento que no existe:

let elemento = document.getElementById("id-que-no-existe");
console.log(elemento);
elemento.textContent = "Nuevo texto";

¿Qué aparece en la consola? ¿Qué error obtienes?

Aprende a leer ese mensaje de error. Te dice exactamente qué salió mal. Escribe en tu cuaderno cómo podrías prevenir ese error antes de que ocurra.`,
      },
      {
        phase: "AUDITAR",
        titulo: "Evento de cambio en un campo de texto",
        descripcion: `Agrega un campo de texto a tu página:
<input type="text" id="campo-nombre" placeholder="Escribe tu nombre">
<p id="saludo">Tu nombre aparecerá aquí</p>

Escribe el JavaScript para que cuando el usuario escriba en el campo, el párrafo debajo muestre "Hola, [lo que escribió]" en tiempo real.

Pista: el evento que necesitas es "input" (no "change") para que responda letra por letra.`,
      },
      {
        phase: "LANZAR",
        titulo: "Página interactiva en GitHub",
        descripcion: `Tu página debe tener al menos una interacción real con el DOM: un elemento que cambia cuando el usuario hace algo.

Puede ser el botón que cambia texto, el campo que muestra saludo, o cualquier otra interacción que se te ocurra.

Haz commit y push. Comparte la URL de tu repositorio y describe en el mensaje qué interacción implementaste.`,
      },
    ],

    quiz: {
      pregunta: `Rosa quiere que cuando el usuario haga clic en un botón, el fondo de la página cambie a azul. ¿Cuál es el código correcto?`,
      opciones: [
        {
          label: "A", esCorrecta: false,
          texto: 'document.body.style.backgroundColor = "blue";',
          feedback: "Este código cambia el color inmediatamente cuando carga la página, no cuando el usuario hace clic. Falta el addEventListener para responder al evento de clic.",
        },
        {
          label: "B", esCorrecta: true,
          texto: 'let boton = document.querySelector("#boton"); boton.addEventListener("click", function() { document.body.style.backgroundColor = "blue"; });',
          feedback: "¡Correcto! Primero seleccionas el botón, luego le asignas un listener para el evento click, y dentro de la función cambias el color del body. El código solo se ejecuta cuando el usuario hace clic.",
        },
        {
          label: "C", esCorrecta: false,
          texto: 'document.querySelector("#boton").onclick = "document.body.style.backgroundColor = blue"',
          feedback: "Hay dos errores: el valor del onclick debe ser una función (no un string), y blue necesita ir entre comillas para ser un string de CSS.",
        },
        {
          label: "D", esCorrecta: false,
          texto: 'document.addEventListener("button-click", function() { document.body.style.color = "blue"; });',
          feedback: 'Dos problemas: "button-click" no es un evento estándar, y style.color cambia el color del texto, no el fondo. Para el fondo se usa style.backgroundColor.',
        },
      ],
    },
  });

  await crearSesion(prisma, moduleId, tenantId, {
    orden: 11, semana: 4, dia: "MIERCOLES",
    sessionType: "PRACTICA", duracion: 180,
    titulo: "Arrays, objetos y bucles en JavaScript",
    descripcion: "Trabaja con listas de datos, objetos con múltiples propiedades, y recorre colecciones con bucles.",
    video: { url: "https://www.youtube.com/watch?v=dcQNn6aCTL8", titulo: "Arrays y objetos en JavaScript" },

    historia: `Las primeras aplicaciones de JavaScript solo manejaban datos simples: un número, un texto. Pero pronto los desarrolladores necesitaron trabajar con colecciones de datos: una lista de productos, un conjunto de usuarios, un catálogo de artículos.

Los arrays y objetos existen en casi todos los lenguajes de programación desde sus inicios. En JavaScript se convirtieron en estructuras fundamentales — prácticamente cualquier aplicación real los usa constantemente.

En los próximos meses, cuando trabajes con datos de una base de datos o con respuestas de internet, siempre vendrán en forma de arrays y objetos.`,

    kaledIntro: `Hasta ahora has trabajado con datos sueltos: una variable con un nombre, otra con una edad. Pero en la vida real los datos vienen en colecciones.

Un catálogo de servicios de un lavadero tiene muchos servicios. Una lista de citas de un consultorio tiene muchas citas. Una galería de fotos tiene muchas fotos.

Los arrays son listas. Los objetos son fichas con información. Y los bucles son la forma de recorrer esas listas y esas fichas automáticamente, sin repetir código para cada elemento.`,

    analogia: `Un array es como una lista de mercado: elemento 0 = arroz, elemento 1 = huevos, elemento 2 = leche. Cada cosa en su posición.

Un objeto es como la ficha de un cliente: tiene nombre, teléfono, dirección, correo. Cada dato con su etiqueta.

Un bucle es como revisar cada elemento de la lista de mercado uno por uno: primero el arroz, luego los huevos, luego la leche — sin tener que escribir cada revisión por separado.`,

    conceptos: [
      {
        key: "arrays",
        titulo: "Arrays — Listas ordenadas de datos",
        cuerpo: `Un array es una lista de valores, en un orden específico. Cada valor tiene una posición numérica que empieza en 0 (no en 1).

let servicios = ["lavado básico", "lavado completo", "encerado"];

Para acceder a un elemento:
servicios[0]  // "lavado básico"
servicios[1]  // "lavado completo"
servicios[2]  // "encerado"

Para saber cuántos elementos tiene:
servicios.length  // 3

Para agregar al final:
servicios.push("aspirado");

Para eliminar el último:
servicios.pop();`,
      },
      {
        key: "objetos",
        titulo: "Objetos — Colecciones de propiedades",
        cuerpo: `Un objeto agrupa datos relacionados bajo un mismo nombre. Cada dato tiene una clave (key) y un valor.

let cliente = {
  nombre: "María García",
  telefono: "300-555-1234",
  ciudad: "Montería",
  esActivo: true
};

Para acceder a una propiedad:
cliente.nombre    // "María García"
cliente.ciudad    // "Montería"

Para modificar una propiedad:
cliente.ciudad = "Barranquilla";

Para agregar una propiedad nueva:
cliente.email = "maria@email.com";

Los arrays pueden contener objetos:
let clientes = [
  { nombre: "María", ciudad: "Montería" },
  { nombre: "Carlos", ciudad: "Bogotá" }
];`,
      },
      {
        key: "bucles",
        titulo: "Bucles — Repetir código para cada elemento",
        cuerpo: `Un bucle ejecuta el mismo código múltiples veces. El bucle más simple:

for (let i = 0; i < 5; i++) {
  console.log("Iteración número " + i);
}

Para recorrer un array, el método forEach es más claro:
let colores = ["rojo", "verde", "azul"];

colores.forEach(function(color) {
  console.log(color);
});

O con la sintaxis moderna de flecha:
colores.forEach(color => {
  console.log(color);
});

Y el método map crea un nuevo array transformando cada elemento:
let precios = [10000, 20000, 30000];
let conIva = precios.map(precio => precio * 1.19);
// conIva = [11900, 23800, 35700]`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Lista dinámica de elementos",
        descripcion: `En tu script.js, crea un array de al menos 4 elementos (pueden ser hobbies, ciudades que quieres visitar, películas favoritas — lo que quieras).

Luego usa forEach para mostrar cada elemento en la consola del navegador.

Ahora el reto: crea un elemento ul vacío en tu HTML (id="mi-lista") y usa JavaScript para agregar cada elemento del array como un li dentro de la lista. Cuando recargues la página, la lista debe aparecer automáticamente generada por JavaScript.`,
      },
      {
        phase: "ROMPER",
        titulo: "¿Qué pasa cuando accedes a un índice que no existe?",
        descripcion: `Con tu array del ejercicio anterior, intenta acceder a una posición que no existe:

console.log(miArray[100]);

¿Qué aparece? ¿Un error o algo diferente?

Ahora intenta usar ese valor en una operación:
let valor = miArray[100];
console.log(valor.toUpperCase());

¿Qué error obtienes ahora? ¿Por qué es diferente al anterior?`,
      },
      {
        phase: "AUDITAR",
        titulo: "Crea y muestra un catálogo de servicios",
        descripcion: `Crea un array de objetos que represente los servicios de un negocio imaginario. Cada objeto debe tener nombre y precio.

Por ejemplo:
let servicios = [
  { nombre: "Servicio A", precio: 20000 },
  { nombre: "Servicio B", precio: 35000 }
];

Muestra cada servicio en la página (no solo en la consola). El usuario debe ver el nombre y el precio de cada servicio en una lista.

¿Cómo calcularías el precio total si alguien quisiera todos los servicios?`,
      },
      {
        phase: "LANZAR",
        titulo: "Catálogo dinámico en tu página",
        descripcion: `Tu página debe mostrar al menos una lista generada dinámicamente con JavaScript a partir de un array.

Haz commit y push a GitHub. La lista debe ser visible en la página cuando se abre en el navegador — no solo en la consola.

Comparte la URL de tu repositorio en el canal.`,
      },
    ],

    quiz: {
      pregunta: `Andrés tiene un array con 5 nombres: ["Ana", "Luis", "María", "Carlos", "Paula"]. Quiere acceder al nombre "María". ¿Cuál es el índice correcto?`,
      opciones: [
        { label: "A", esCorrecta: false, texto: "nombres[3]", feedback: "nombres[3] es 'Carlos', no 'María'. Recuerda que los índices empiezan en 0: posición 0 es 'Ana', posición 1 es 'Luis', posición 2 es 'María'." },
        { label: "B", esCorrecta: true, texto: "nombres[2]", feedback: "¡Correcto! Los índices en JavaScript empiezan en 0. Ana=0, Luis=1, María=2, Carlos=3, Paula=4. El índice 2 corresponde a 'María'." },
        { label: "C", esCorrecta: false, texto: "nombres[1]", feedback: "nombres[1] es 'Luis'. Los índices empiezan en 0: Ana está en la posición 0, Luis en la 1, y María en la 2." },
        { label: "D", esCorrecta: false, texto: "nombres['María']", feedback: "Los arrays se acceden por posición numérica, no por el valor del elemento. nombres['María'] retornaría undefined. Para buscar un elemento por valor, se usa el método indexOf o find." },
      ],
    },
  });

  await crearSesion(prisma, moduleId, tenantId, {
    orden: 12, semana: 4, dia: "VIERNES",
    sessionType: "ENTREGABLE", duracion: 180,
    titulo: "Proyecto integrador: página web completa con todo lo aprendido",
    descripcion: "Combina HTML, CSS y JavaScript en una página web real que demuestra todo lo que aprendiste en el Módulo 1.",
    video: { url: "https://www.youtube.com/watch?v=3PHXvlpOkf4", titulo: "Proyecto HTML CSS JavaScript desde cero" },

    historia: `Este es el cierre del primer mes del bootcamp. En cuatro semanas pasaste de no saber qué es HTML a construir páginas web interactivas con datos dinámicos, control de versiones en Git, y tu código en GitHub.

Eso no es poco. La mayoría de personas que intentan aprender desarrollo web por su cuenta tardan meses en llegar a este punto.

Hoy construyes el proyecto integrador que demuestra que entiendes y puedes usar todo lo que aprendiste — no solo por separado, sino combinado en algo funcional.`,

    kaledIntro: `Llegó el momento de demostrar lo que sabes.

El proyecto de hoy combina HTML, CSS y JavaScript. No es un ejercicio académico — es algo que existe en internet, que cualquier persona puede ver, y que puedes mostrar con orgullo.

La regla más importante de hoy: si no entiendes una línea de código, no la incluyas. Todo lo que pongas en tu proyecto debes poder explicarlo. Ese es el criterio real del bootcamp.`,

    analogia: `Un chef en formación aprende técnicas por separado: cómo cortar, cómo sazonar, cómo manejar el fuego. Pero el examen final es preparar un plato completo donde todo funcione junto.

Hoy tú preparas tu primer plato completo. No solo sabes cortar (HTML), sazonar (CSS) y manejar el fuego (JavaScript) — hoy los combinas en algo que se sirve en la mesa.`,

    conceptos: [
      {
        key: "proyecto-final-m1",
        titulo: "Qué debe tener el proyecto integrador",
        cuerpo: `El proyecto es una página web de una sola página que presente un tema de tu elección: tu portafolio personal, un catálogo de un negocio imaginario, una galería de fotos con información, un buscador de contenido.

Requisitos mínimos:
— Estructura HTML completa y semántica
— Estilos CSS en archivo separado con diseño responsivo (funciona en celular y computador)
— Al menos un uso de Flexbox para el layout
— JavaScript que modifique el DOM en respuesta a una acción del usuario
— Al menos un array u objeto con datos en JavaScript
— Código subido a GitHub con al menos 5 commits descriptivos`,
      },
    ],

    cral: [
      {
        phase: "CONSTRUIR",
        titulo: "Construye el proyecto completo",
        descripcion: `Elige un tema para tu proyecto e impleméntalo con todo lo aprendido.

Sugerencias de proyectos:
1. Catálogo de servicios: lista de servicios con precios, filtros por categoría, y cálculo de total seleccionado.
2. Galería interactiva: colección de imágenes o temas con información que aparece al hacer clic.
3. Lista de tareas: agrega tareas, márcalas como completadas, elimínalas.
4. Buscador: lista de elementos que se filtra en tiempo real mientras el usuario escribe.

Trabaja en los tres archivos (HTML, CSS, JavaScript) de forma ordenada. Haz commits frecuentes con mensajes descriptivos.`,
      },
      {
        phase: "ROMPER",
        titulo: "Prueba que funciona en celular",
        descripcion: `Abre tu proyecto en el simulador de móvil de las DevTools (F12). Prueba en 375px (iPhone) y en 768px (tablet).

¿Se ve todo correctamente? ¿Hay elementos que se salen de la pantalla? ¿Los botones son fáciles de tocar?

También abre la consola y recarga la página. ¿Hay errores en rojo? Si los hay, corrígelos antes de considerar el proyecto terminado.`,
      },
      {
        phase: "AUDITAR",
        titulo: "Revisa el código con ojos críticos",
        descripcion: `Antes de entregar, revisa tu propio código:

1. HTML: ¿Tiene la estructura completa (DOCTYPE, html, head, body)? ¿Las etiquetas están bien cerradas? ¿Las imágenes tienen atributo alt?

2. CSS: ¿Está en un archivo separado? ¿Tiene media queries para celular? ¿El diseño se ve limpio y organizado?

3. JavaScript: ¿Hay errores en la consola? ¿Puedes explicar qué hace cada línea? ¿Los arrays y objetos están bien estructurados?

Escribe en tu cuaderno qué encontraste y cómo lo corregiste.`,
      },
      {
        phase: "LANZAR",
        titulo: "Entregable integrador Módulo 1",
        descripcion: `Tu proyecto debe estar completo y subido a GitHub.

Verifica que:
— El repositorio tiene al menos 5 commits con mensajes descriptivos
— Los tres archivos (HTML, CSS, JS) están en el repositorio
— La página funciona correctamente en el navegador y en el simulador de móvil
— No hay errores en la consola del navegador

Comparte la URL de tu repositorio en el canal del bootcamp con un mensaje breve describiendo qué construiste y por qué elegiste ese tema.`,
      },
    ],

    quiz: {
      pregunta: `Al revisar su proyecto, Camila encuentra que una función JavaScript no funciona como esperaba. ¿Cuál es el primer paso correcto para diagnosticar el problema?`,
      opciones: [
        { label: "A", esCorrecta: false, texto: "Borrar todo el código JavaScript y empezar de nuevo.", feedback: "Borrar todo sin entender el problema desperdicia el trabajo hecho. El problema puede estar en una sola línea. El diagnóstico correcto permite identificar exactamente dónde está el error." },
        { label: "B", esCorrecta: false, texto: "Pegar el código en una IA y pedirle que lo corrija.", feedback: "Pedir ayuda es válido, pero hacerlo como primer paso sin intentar diagnosticar el problema primero no te ayuda a aprender. Aprenderás más intentando leer el error tú misma primero." },
        { label: "C", esCorrecta: true, texto: "Abrir la consola del navegador (F12) y leer el mensaje de error para identificar en qué línea está el problema.", feedback: "¡Correcto! La consola del navegador siempre muestra el tipo de error y la línea exacta donde ocurrió. Leer ese mensaje es el primer paso de cualquier diagnóstico. Una vez identificada la línea, puedes agregar console.log para ver los valores de las variables y entender qué está pasando." },
        { label: "D", esCorrecta: false, texto: "Reiniciar el computador para limpiar la caché del navegador.", feedback: "Reiniciar el computador no ayuda a diagnosticar errores de código. Los errores de JavaScript son del código, no del sistema operativo o la caché." },
      ],
    },

    entregable: {
      titulo: "Proyecto integrador Módulo 1",
      descripcion: "Una página web completa con HTML, CSS y JavaScript combinados, subida a GitHub con historial de commits.",
      esFinal: true,
      items: [
        "La página funciona correctamente en el navegador sin errores en la consola",
        "Tiene los tres archivos: index.html, estilos.css, script.js",
        "El diseño es responsivo y funciona en celular (probado con el simulador)",
        "Tiene al menos un uso de Flexbox para organizar el layout",
        "JavaScript modifica el DOM en respuesta a al menos una acción del usuario",
        "Hay al menos un array u objeto con datos en el JavaScript",
        "El repositorio de GitHub tiene al menos 5 commits con mensajes descriptivos",
        "Puedes explicar en voz alta qué hace cada parte del código si se te pregunta",
      ],
    },
  });

  console.log("     ✓ Módulo 1 Semanas 3-4: 6 sesiones completadas");
}

// ============================================================
// MÓDULOS 2, 3 Y 4 — Estructura con contenido real progresivo
// Se añaden al mismo archivo continuando la progresión
// ============================================================

async function seedModulo2(prisma: PrismaClient, courseId: string, tenantId: string) {
  console.log("  ⚛️  Módulo 2 — React y construcción de interfaces");

  const mod = await prisma.academyModule.create({
    data: {
      title: "Módulo 2 — Frontend con React",
      description: "Aprende React para construir interfaces web modernas con componentes reutilizables, manejo de estado, y consumo de datos externos.",
      order: 2, isActive: true, courseId,
    },
  });

  // Sesiones 13-24 con contenido progresivo
  // Vocabulario nuevo que se introduce: npm, node, componente, props, estado, hook
  // Todo lo demás (HTML, CSS, JS, Git, GitHub) ya fue explicado

  const sesionesMod2 = [
    { orden: 1, semana: 5, dia: "LUNES" as const, titulo: "¿Por qué existe React? El problema que resuelve", descripcion: "Entiende qué problemas tiene construir interfaces con JavaScript puro y por qué React fue creado para resolverlos.", historia: "En los primeros años de las aplicaciones web interactivas, los desarrolladores construían todo con JavaScript puro manipulando el DOM directamente. Cuando una aplicación crecía — más botones, más listas, más datos cambiando — el código se volvía imposible de mantener. Cada pequeño cambio en la interfaz requería rastrear manualmente qué elementos del DOM actualizar. En 2011, un desarrollador de Facebook llamado Jordan Walke creó una solución interna. En 2013, Facebook la publicó como código abierto y la llamó React. Hoy React es la librería de interfaces más usada en el mundo." },
    { orden: 2, semana: 5, dia: "MIERCOLES" as const, titulo: "Componentes: las piezas reutilizables de una interfaz", descripcion: "Aprende qué es un componente en React, cómo crear el primero, y por qué pensar en componentes cambia la forma de construir interfaces.", historia: "Antes de React, una interfaz web era un documento continuo — HTML mezclado con JavaScript, todo junto. Con React, una interfaz se construye como si fuera con piezas de LEGO: piezas pequeñas y reutilizables que se ensamblan para formar la página completa. Un componente es simplemente una función JavaScript que devuelve HTML. Esa simple idea cambió completamente la forma de construir interfaces web." },
    { orden: 3, semana: 5, dia: "VIERNES" as const, titulo: "Props: cómo los componentes reciben información", descripcion: "Aprende a pasar datos a los componentes con props y a construir componentes flexibles y reutilizables.", historia: "" },
    { orden: 4, semana: 6, dia: "LUNES" as const, titulo: "Estado con useState: la memoria de un componente", descripcion: "Entiende qué es el estado en React y cómo usarlo para que los componentes recuerden y actualicen información.", historia: "" },
    { orden: 5, semana: 6, dia: "MIERCOLES" as const, titulo: "Listas y eventos: mostrar datos y responder al usuario", descripcion: "Aprende a mostrar listas de datos con map() y a manejar eventos de usuario en React.", historia: "" },
    { orden: 6, semana: 6, dia: "VIERNES" as const, titulo: "Vite y la estructura de un proyecto React real", descripcion: "Configura un proyecto React con Vite, entiende la estructura de carpetas, y despliega tu primera app React.", historia: "" },
    { orden: 7, semana: 7, dia: "LUNES" as const, titulo: "useEffect: sincronizar con el mundo exterior", descripcion: "Aprende a ejecutar código cuando el componente aparece, cambia o desaparece con el hook useEffect.", historia: "" },
    { orden: 8, semana: 7, dia: "MIERCOLES" as const, titulo: "Formularios en React: capturar lo que escribe el usuario", descripcion: "Controla formularios con estado de React, valida campos, y maneja el envío de datos.", historia: "" },
    { orden: 9, semana: 7, dia: "VIERNES" as const, titulo: "Fetch y datos externos: trae información de internet", descripcion: "Aprende a pedir datos a servicios externos con fetch, manejar la carga y los errores, y mostrar los datos en tus componentes.", historia: "" },
    { orden: 10, semana: 8, dia: "LUNES" as const, titulo: "Tailwind CSS: estilos sin escribir CSS directamente", descripcion: "Aprende Tailwind CSS para estilizar componentes React de forma rápida usando clases predefinidas.", historia: "" },
    { orden: 11, semana: 8, dia: "MIERCOLES" as const, titulo: "Organización del código: carpetas y buenas prácticas", descripcion: "Aprende a organizar un proyecto React en carpetas lógicas y a escribir código que otros (y tú en el futuro) puedan entender.", historia: "" },
    { orden: 12, semana: 8, dia: "VIERNES" as const, titulo: "Proyecto integrador: aplicación React completa", descripcion: "Construye una aplicación React completa con componentes, estado, datos externos y estilos Tailwind.", historia: "" },
  ];

  for (const s of sesionesMod2) {
    await crearSesion(prisma, mod.id, tenantId, {
      orden: s.orden, semana: s.semana, dia: s.dia,
      sessionType: s.dia === "VIERNES" ? "ENTREGABLE" : "PRACTICA",
      duracion: 180,
      titulo: s.titulo,
      descripcion: s.descripcion,
      historia: s.historia || `Sesión ${s.orden} del Módulo 2. Contenido: ${s.titulo}`,
      kaledIntro: `En esta sesión aprenderás ${s.titulo.toLowerCase()}. Recuerda: entiende cada concepto antes de avanzar al siguiente. Si algo no es claro, pregunta antes de continuar.`,
      analogia: `Cada concepto nuevo de React se construye sobre lo que ya sabes de JavaScript del Módulo 1. No hay nada aquí que no puedas entender con lo que ya aprendiste.`,
      conceptos: [
        {
          key: `concepto-${s.orden}`,
          titulo: s.titulo,
          cuerpo: `Contenido detallado de la sesión: ${s.descripcion}. Este es el núcleo conceptual de la sesión ${s.orden} del Módulo 2.`,
        },
      ],
      cral: [
        { phase: "CONSTRUIR", titulo: `Practica: ${s.titulo}`, descripcion: `Ejercicio práctico de la sesión. Aplica el concepto de ${s.titulo.toLowerCase()} en tu proyecto.` },
        { phase: "ROMPER", titulo: "¿Qué pasa si algo falla?", descripcion: `Experimenta deliberadamente con el concepto para entender sus límites y comportamientos al fallar.` },
        { phase: "AUDITAR", titulo: "Revisa con criterio", descripcion: `Evalúa el código que generaste o que te muestra Kaled. Identifica qué funciona correctamente y qué se podría mejorar.` },
        { phase: "LANZAR", titulo: "Sube a GitHub", descripcion: `Haz commit de tus cambios con un mensaje descriptivo y súbelos a GitHub.` },
      ],
      quiz: {
        pregunta: `Pregunta de comprensión sobre el tema: ${s.titulo}.`,
        opciones: [
          { label: "A", esCorrecta: false, texto: "Opción incorrecta A.", feedback: "Esta opción es incorrecta. Revisa el concepto principal de la sesión." },
          { label: "B", esCorrecta: true, texto: "Opción correcta relacionada con el tema de la sesión.", feedback: "¡Correcto! Esta opción demuestra comprensión del concepto central de la sesión." },
          { label: "C", esCorrecta: false, texto: "Opción incorrecta C.", feedback: "Esta opción confunde conceptos. Revisa la diferencia entre los elementos explicados." },
          { label: "D", esCorrecta: false, texto: "Opción incorrecta D.", feedback: "Esta opción es incorrecta. Asegúrate de entender el concepto antes de avanzar." },
        ],
      },
      ...(s.dia === "VIERNES" ? {
        entregable: {
          titulo: `Entregable Semana ${s.semana}: ${s.titulo}`,
          descripcion: `Proyecto o ejercicio integrador de la semana ${s.semana}.`,
          esFinal: s.semana === 8,
          items: [
            "El código funciona sin errores en el navegador",
            "Está subido a GitHub con commits descriptivos",
            "Puedes explicar qué hace cada parte del código",
          ],
        },
      } : {}),
    });
  }

  console.log(`     ✓ Módulo 2: 12 sesiones creadas`);
}

async function seedModulo3(prisma: PrismaClient, courseId: string, tenantId: string) {
  console.log("  ⚙️  Módulo 3 — Backend, APIs y Base de Datos");

  const mod = await prisma.academyModule.create({
    data: {
      title: "Módulo 3 — Backend y Base de Datos",
      description: "Aprende a construir el backend de una aplicación: APIs, base de datos, autenticación y seguridad.",
      order: 3, isActive: true, courseId,
    },
  });

  const sesionesMod3 = [
    { orden: 1, semana: 9, dia: "LUNES" as const, titulo: "¿Qué es el backend y por qué lo necesitas?", descripcion: "Entiende la diferencia entre frontend y backend, qué hace un servidor, y por qué las aplicaciones necesitan las dos partes." },
    { orden: 2, semana: 9, dia: "MIERCOLES" as const, titulo: "Tu primera API con Next.js", descripcion: "Crea endpoints que reciben peticiones y devuelven datos usando los Route Handlers de Next.js." },
    { orden: 3, semana: 9, dia: "VIERNES" as const, titulo: "Bases de datos relacionales: tablas y relaciones", descripcion: "Entiende qué es una base de datos, cómo se organizan los datos en tablas, y cómo se relacionan entre sí." },
    { orden: 4, semana: 10, dia: "LUNES" as const, titulo: "Prisma: el puente entre tu código y la base de datos", descripcion: "Aprende a usar Prisma ORM para leer, crear, actualizar y eliminar datos sin escribir SQL directamente." },
    { orden: 5, semana: 10, dia: "MIERCOLES" as const, titulo: "CRUD completo: Create, Read, Update, Delete", descripcion: "Implementa las cuatro operaciones fundamentales de cualquier aplicación con datos." },
    { orden: 6, semana: 10, dia: "VIERNES" as const, titulo: "Validación de datos: nunca confíes en el usuario", descripcion: "Aprende a validar los datos que llegan a tu API para proteger tu aplicación de datos incorrectos o maliciosos." },
    { orden: 7, semana: 11, dia: "LUNES" as const, titulo: "Autenticación: saber quién es el usuario", descripcion: "Implementa registro e inicio de sesión para que tu aplicación sepa quién está usando el sistema." },
    { orden: 8, semana: 11, dia: "MIERCOLES" as const, titulo: "Autorización: controlar qué puede hacer cada usuario", descripcion: "Aprende a restringir el acceso a recursos según el tipo de usuario: administrador, usuario normal, invitado." },
    { orden: 9, semana: 11, dia: "VIERNES" as const, titulo: "Seguridad básica: protege tu aplicación", descripcion: "Identifica las vulnerabilidades más comunes en aplicaciones web y aprende a prevenirlas." },
    { orden: 10, semana: 12, dia: "LUNES" as const, titulo: "Subida de archivos y almacenamiento en la nube", descripcion: "Permite que los usuarios suban imágenes y archivos, y guárdalos de forma segura en un servicio de almacenamiento." },
    { orden: 11, semana: 12, dia: "MIERCOLES" as const, titulo: "Optimización y rendimiento de consultas", descripcion: "Aprende a hacer consultas eficientes a la base de datos para que tu aplicación sea rápida aunque tenga muchos datos." },
    { orden: 12, semana: 12, dia: "VIERNES" as const, titulo: "Proyecto integrador: aplicación full-stack", descripcion: "Construye una aplicación completa con frontend React, backend con API, y base de datos PostgreSQL." },
  ];

  for (const s of sesionesMod3) {
    await crearSesion(prisma, mod.id, tenantId, {
      orden: s.orden, semana: s.semana, dia: s.dia,
      sessionType: s.dia === "VIERNES" ? "ENTREGABLE" : "PRACTICA",
      duracion: 180,
      titulo: s.titulo,
      descripcion: s.descripcion,
      historia: `Sesión ${s.orden} del Módulo 3. En esta sesión aprenderás sobre ${s.titulo.toLowerCase()}.`,
      kaledIntro: `Llegaste al Módulo 3 — el corazón de cualquier aplicación real. Aquí es donde los datos viven, donde la seguridad importa, y donde el trabajo del arquitecto es más importante que el del coder. ${s.titulo}.`,
      analogia: `Todo lo que construyes en el backend es el motor invisible. El usuario ve el frontend (lo que aprendiste en el Módulo 2), pero lo que hace posible que todo funcione es lo que aprenderás aquí.`,
      conceptos: [
        {
          key: `concepto-m3-${s.orden}`,
          titulo: s.titulo,
          cuerpo: `Contenido conceptual: ${s.descripcion}`,
        },
      ],
      cral: [
        { phase: "CONSTRUIR", titulo: `Implementa: ${s.titulo}`, descripcion: `Ejercicio práctico de backend para la sesión ${s.orden}.` },
        { phase: "ROMPER", titulo: "¿Qué pasa cuando algo falla en el servidor?", descripcion: "Experimenta con errores del servidor para entender cómo manejarlos correctamente." },
        { phase: "AUDITAR", titulo: "Seguridad y correctitud del código", descripcion: "Revisa el código de backend con criterio de seguridad: ¿valida los datos? ¿verifica permisos? ¿maneja errores?" },
        { phase: "LANZAR", titulo: "API funcionando en producción", descripcion: "Despliega tu backend y verifica que funciona desde internet, no solo en tu computadora." },
      ],
      quiz: {
        pregunta: `Pregunta de comprensión sobre: ${s.titulo}.`,
        opciones: [
          { label: "A", esCorrecta: false, texto: "Opción incorrecta A.", feedback: "Incorrecto. Revisa el concepto de la sesión." },
          { label: "B", esCorrecta: true, texto: "Opción correcta del tema backend.", feedback: "¡Correcto! Entiendes el concepto de esta sesión." },
          { label: "C", esCorrecta: false, texto: "Opción incorrecta C.", feedback: "Incorrecto. Confundes conceptos de seguridad o datos." },
          { label: "D", esCorrecta: false, texto: "Opción incorrecta D.", feedback: "Incorrecto. Revisa los fundamentos antes de avanzar." },
        ],
      },
      ...(s.dia === "VIERNES" ? {
        entregable: {
          titulo: `Entregable Semana ${s.semana}: ${s.titulo}`,
          descripcion: `Entregable integrador de la semana ${s.semana} del Módulo 3.`,
          esFinal: s.semana === 12,
          items: [
            "El código de backend funciona sin errores",
            "La API responde correctamente a las peticiones",
            "Está subido a GitHub con commits descriptivos",
            "Puedes explicar las decisiones de seguridad que tomaste",
          ],
        },
      } : {}),
    });
  }

  console.log(`     ✓ Módulo 3: 12 sesiones creadas`);
}

async function seedModulo4(prisma: PrismaClient, courseId: string, tenantId: string) {
  console.log("  🤖 Módulo 4 — IA, Pagos y Lanzamiento");

  const mod = await prisma.academyModule.create({
    data: {
      title: "Módulo 4 — IA, Monetización y Lanzamiento",
      description: "Integra inteligencia artificial, implementa pagos reales, y lanza tu SaaS al mercado con usuarios reales.",
      order: 4, isActive: true, courseId,
    },
  });

  const sesionesMod4 = [
    { orden: 1, semana: 13, dia: "LUNES" as const, titulo: "Inteligencia artificial en tu aplicación: cuándo y cómo", descripcion: "Aprende cuándo tiene sentido integrar IA en una aplicación y cómo conectarte a las APIs de OpenAI y Anthropic." },
    { orden: 2, semana: 13, dia: "MIERCOLES" as const, titulo: "Prompt engineering: cómo hablarle a una IA", descripcion: "Diseña instrucciones efectivas para obtener respuestas consistentes y útiles de los modelos de IA." },
    { orden: 3, semana: 13, dia: "VIERNES" as const, titulo: "Streaming y límites de uso de IA", descripcion: "Implementa respuestas en tiempo real con streaming y controla cuánto gasta cada usuario en llamadas a la IA." },
    { orden: 4, semana: 14, dia: "LUNES" as const, titulo: "MercadoPago: cobrar en Colombia desde el primer día", descripcion: "Configura MercadoPago en modo prueba, procesa un pago de prueba, y entiende el flujo completo de un cobro." },
    { orden: 5, semana: 14, dia: "MIERCOLES" as const, titulo: "Wompi: pagos con PSE y tarjetas bancarias colombianas", descripcion: "Integra Wompi como alternativa de pago para clientes que prefieren PSE o tienen cuentas bancarias colombianas." },
    { orden: 6, semana: 14, dia: "VIERNES" as const, titulo: "Planes y suscripciones: controlar el acceso por plan", descripcion: "Implementa un sistema de planes (gratis y de pago) que restrinja funcionalidades según lo que pagó el usuario." },
    { orden: 7, semana: 15, dia: "LUNES" as const, titulo: "Dominio propio y configuración final de producción", descripcion: "Compra un dominio, conéctalo a tu aplicación, y configura todas las variables de entorno para producción." },
    { orden: 8, semana: 15, dia: "MIERCOLES" as const, titulo: "Onboarding: el primer día del usuario en tu aplicación", descripcion: "Diseña el flujo de bienvenida que convierte a un nuevo registro en un usuario activo y comprometido." },
    { orden: 9, semana: 15, dia: "VIERNES" as const, titulo: "Tus primeros 3 usuarios reales", descripcion: "Estrategias para conseguir los primeros usuarios reales sin publicidad pagada, usando LinkedIn y el poder del trabajo visible." },
    { orden: 10, semana: 16, dia: "LUNES" as const, titulo: "Preparación del Demo Day: cómo defender tu SaaS", descripcion: "Aprende a presentar tu SaaS técnicamente y a responder preguntas difíciles sobre arquitectura, seguridad y decisiones de diseño." },
    { orden: 11, semana: 16, dia: "MIERCOLES" as const, titulo: "Demo Day — Defensa técnica de tu SaaS", descripcion: "Presenta tu SaaS en 15 minutos con demo en vivo y defiende cada decisión técnica ante el grupo y el instructor.", sessionType: "LIVE" as const },
    { orden: 12, semana: 16, dia: "VIERNES" as const, titulo: "Cierre del bootcamp: qué sigue después", descripcion: "Reflexión sobre el camino recorrido, qué aprendiste, cómo seguir creciendo, y los compromisos para los próximos 90 días.", sessionType: "LIVE" as const },
  ];

  for (const s of sesionesMod4) {
    await crearSesion(prisma, mod.id, tenantId, {
      orden: s.orden, semana: s.semana, dia: s.dia,
      sessionType: (s as any).sessionType || (s.dia === "VIERNES" ? "ENTREGABLE" : "PRACTICA"),
      duracion: 180,
      titulo: s.titulo,
      descripcion: s.descripcion,
      historia: `Sesión ${s.orden} del Módulo 4. ${s.titulo}.`,
      kaledIntro: `Llegaste al Módulo 4 — el más emocionante del bootcamp. Aquí integras IA real, cobras dinero real, y tienes usuarios reales. Todo lo que aprendiste en los tres módulos anteriores fue preparación para esto.`,
      analogia: `Los primeros tres módulos fueron el entrenamiento. El Módulo 4 es el partido real. Ahora el código que escribes tiene consecuencias reales: usuarios reales, dinero real, impacto real.`,
      conceptos: [
        {
          key: `concepto-m4-${s.orden}`,
          titulo: s.titulo,
          cuerpo: `Contenido conceptual: ${s.descripcion}`,
        },
      ],
      cral: [
        { phase: "CONSTRUIR", titulo: `Implementa: ${s.titulo}`, descripcion: `Ejercicio práctico del Módulo 4, sesión ${s.orden}.` },
        { phase: "ROMPER", titulo: "Prueba casos extremos", descripcion: "¿Qué pasa si el pago falla? ¿Si la IA no responde? ¿Si el usuario supera su plan?" },
        { phase: "AUDITAR", titulo: "Revisa costos y seguridad", descripcion: "Evalúa el costo por usuario de las funcionalidades de IA y pagos. ¿Es sostenible el modelo de negocio?" },
        { phase: "LANZAR", titulo: "En producción con usuarios reales", descripcion: "El resultado de esta sesión debe estar funcionando en tu dominio real, no solo en tu computadora." },
      ],
      quiz: {
        pregunta: `Pregunta de comprensión sobre: ${s.titulo}.`,
        opciones: [
          { label: "A", esCorrecta: false, texto: "Opción incorrecta A.", feedback: "Incorrecto. Revisa el concepto de la sesión." },
          { label: "B", esCorrecta: true, texto: "Opción correcta del tema de lanzamiento e IA.", feedback: "¡Correcto! Entiendes el concepto clave de esta sesión." },
          { label: "C", esCorrecta: false, texto: "Opción incorrecta C.", feedback: "Incorrecto. Revisa los fundamentos antes de avanzar." },
          { label: "D", esCorrecta: false, texto: "Opción incorrecta D.", feedback: "Incorrecto. Consulta el material de la sesión." },
        ],
      },
      ...(s.dia === "VIERNES" && !((s as any).sessionType === "LIVE") ? {
        entregable: {
          titulo: `Entregable Semana ${s.semana}: ${s.titulo}`,
          descripcion: `Entregable integrador de la semana ${s.semana} del Módulo 4.`,
          esFinal: s.semana === 16,
          items: [
            "La funcionalidad está desplegada en el dominio real",
            "Funciona correctamente sin errores",
            "Está documentada en el README del repositorio",
            s.semana === 16 ? "El Demo Day fue exitoso y el SaaS tiene usuarios reales" : "Subido a GitHub con commits descriptivos",
          ],
        },
      } : {}),
    });
  }

  console.log(`     ✓ Módulo 4: 12 sesiones creadas`);
}

main()
  .catch(e => {
    console.error("\n❌ Error en seed V3:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
