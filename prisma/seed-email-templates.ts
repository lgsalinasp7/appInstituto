/**
 * Seed de Plantillas Pre-diseñadas de Email
 * Sistema de Email Marketing Automatizado - KaledSoft CRM
 *
 * Este seed crea 11 plantillas con copywriting optimizado para el funnel de ventas
 * del programa "Constructor de SaaS con IA"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const emailTemplates = [
  // ============================================
  // FASE 1: Post-Aplicación (3 emails)
  // ============================================
  {
    name: 'Fase 1 - Email 1: Confirmación Inmediata',
    subject: 'Tu aplicación fue recibida – Lee esto',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h2 style="color: #2c3e50; margin-top: 0;">Hola {{Nombre}},</h2>
    <p style="font-size: 16px;">Tu aplicación para la masterclass <strong>"Construye tu SaaS con IA"</strong> fue recibida.</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>Fecha:</strong> {{Fecha}}</p>
    <p><strong>Hora:</strong> {{Hora}}</p>
    <p><strong>Modalidad:</strong> 100% online en vivo</p>
  </div>

  <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
    <p style="margin: 0;"><strong>⚠️ Importante:</strong> Esta no es una masterclass tradicional.</p>
  </div>

  <p>No vamos a hablar de teoría.</p>
  <p>No vamos a darte un montón de información que nunca vas a usar.</p>
  <p>Vamos a <strong>construir</strong>. En vivo. Con código real.</p>

  <h3 style="color: #2c3e50;">Lo que vas a ver:</h3>
  <ul style="line-height: 1.8;">
    <li>Cómo usar IA para escribir código que realmente funciona (no copy-paste que explota)</li>
    <li>La arquitectura exacta que usamos para SaaS que facturan</li>
    <li>Los 3 errores que hacen que tu proyecto nunca despegue</li>
    <li>Por qué la universidad no te prepara para esto (y qué hacer al respecto)</li>
  </ul>

  <h3 style="color: #2c3e50;">Lo que NO vas a ver:</h3>
  <ul style="line-height: 1.8;">
    <li>❌ PowerPoints llenos de teoría aburrida</li>
    <li>❌ Promesas vacías de "hacerte millonario"</li>
    <li>❌ Tutoriales de YouTube disfrazados de masterclass</li>
  </ul>

  <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0; font-weight: bold; color: #0c5460;">📌 Guarda este email. Te voy a mandar el enlace el día del evento.</p>
  </div>

  <p>Nos vemos el <strong>{{Fecha}}</strong>.</p>

  <p style="margin-top: 30px;">
    Un saludo,<br>
    <strong>El equipo de KaledSoft</strong>
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
    <p>Si no solicitaste esta masterclass, ignora este email.</p>
  </div>

</body>
</html>
    `,
    variables: ['Nombre', 'Fecha', 'Hora'],
    category: 'AUTOMATIC',
    phase: 'FASE_1',
    isLibraryTemplate: true,
  },

  {
    name: 'Fase 1 - Email 2: Construcción de Tensión',
    subject: 'La verdad que nadie te dice en la universidad',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <h2 style="color: #2c3e50;">Hola {{Nombre}},</h2>

  <p>Te voy a decir algo que probablemente ya sospechas:</p>

  <div style="background-color: #f8d7da; padding: 20px; border-left: 4px solid #dc3545; margin: 25px 0;">
    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #721c24;">La universidad te está preparando para trabajos que ya no existen.</p>
  </div>

  <p>No es su culpa. El sistema educativo tradicional se mueve lento.</p>
  <p>Muy lento.</p>

  <p>Mientras ellos actualizan el pensum cada 5 años, el mercado cambia cada 6 meses.</p>

  <h3 style="color: #2c3e50;">La realidad es esta:</h3>

  <p>Las empresas ya no buscan empleados que sepan teoría.</p>
  <p>Buscan gente que <strong>construya cosas que funcionen</strong>.</p>
  <p>Que resuelvan problemas reales.</p>
  <p>Que no necesiten 6 meses de capacitación para aportar valor.</p>

  <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h4 style="margin-top: 0; color: #155724;">¿Qué pasa si en lugar de esperar 3 años a graduarte...</h4>
    <p style="margin-bottom: 0;">...pudieras tener un SaaS funcionando y generando ingresos en 4 meses?</p>
  </div>

  <p>Eso es exactamente lo que hacemos.</p>

  <p>No te enseñamos código por enseñar.</p>
  <p>Te acompañamos a <strong>publicar un SaaS real</strong> que resuelva un problema real.</p>

  <p style="margin-top: 30px;">En la masterclass del <strong>{{Fecha}}</strong> te voy a mostrar cómo.</p>

  <p style="margin-top: 30px;">
    Nos vemos ahí,<br>
    <strong>El equipo de KaledSoft</strong>
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
    <p>PD: Si crees que esto no es para ti, no problema. Simplemente no aparezcas el {{Fecha}}. Pero si sientes que la universidad no te está dando lo que necesitas... dale una oportunidad a esta masterclass.</p>
  </div>

</body>
</html>
    `,
    variables: ['Nombre', 'Fecha'],
    category: 'AUTOMATIC',
    phase: 'FASE_1',
    isLibraryTemplate: true,
  },

  {
    name: 'Fase 1 - Email 3: Prueba Social',
    subject: 'Esto no es para todos',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <h2 style="color: #2c3e50;">{{Nombre}},</h2>

  <p>Quiero ser directo contigo:</p>

  <p><strong>Este programa no es para todo el mundo.</strong></p>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="margin-top: 0; color: #2c3e50;">No es para ti si:</h3>
    <ul style="line-height: 1.8;">
      <li>Buscas un título bonito para colgar en la pared</li>
      <li>Quieres que alguien haga el trabajo por ti</li>
      <li>Prefieres "aprender" viendo videos que nunca aplicas</li>
      <li>Solo quieres agregar una línea más a tu CV</li>
    </ul>
  </div>

  <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="margin-top: 0; color: #0c5460;">Es para ti si:</h3>
    <ul style="line-height: 1.8;">
      <li>✅ Estás dispuesto a trabajar duro durante 4 meses</li>
      <li>✅ Quieres construir algo real, no solo "aprender"</li>
      <li>✅ Te aburre la teoría sin aplicación</li>
      <li>✅ Prefieres tener un producto funcionando que 10 certificados</li>
    </ul>
  </div>

  <h3 style="color: #2c3e50;">Lo que dicen quienes ya lo hicieron:</h3>

  <div style="background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 15px 0;">
    <p style="font-style: italic; margin-bottom: 10px;">"En 3 meses logré más que en 2 años de carrera. Ya tengo mi primer cliente pagando."</p>
    <p style="margin: 0; color: #666; font-size: 14px;">- Juan, 21 años, Barranquilla</p>
  </div>

  <div style="background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 15px 0;">
    <p style="font-style: italic; margin-bottom: 10px;">"Dejé de sentirme perdido. Ahora sé exactamente qué hacer y cómo hacerlo."</p>
    <p style="margin: 0; color: #666; font-size: 14px;">- María, 19 años, Cartagena</p>
  </div>

  <div style="background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 15px 0;">
    <p style="font-style: italic; margin-bottom: 10px;">"Lo mejor: no hay relleno. Todo lo que enseñan lo usas. Nada de teoría inútil."</p>
    <p style="margin: 0; color: #666; font-size: 14px;">- Carlos, 22 años, Santa Marta</p>
  </div>

  <p style="margin-top: 30px;">La masterclass es <strong>mañana, {{Fecha}}</strong>.</p>

  <p>Ahí te cuento todo: cómo funciona el programa, qué vas a construir, cuánto cuesta, y qué garantías tienes.</p>

  <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 25px 0;">
    <p style="margin: 0;"><strong>Nos vemos en vivo.</strong> No hay replay. O estás o no estás.</p>
  </div>

  <p style="margin-top: 30px;">
    Un saludo,<br>
    <strong>El equipo de KaledSoft</strong>
  </p>

</body>
</html>
    `,
    variables: ['Nombre', 'Fecha'],
    category: 'AUTOMATIC',
    phase: 'FASE_1',
    isLibraryTemplate: true,
  },

  // ============================================
  // FASE 2: Recordatorios Masterclass (2 emails)
  // ============================================
  {
    name: 'Fase 2 - Email 4: Día del Evento',
    subject: 'Hoy es la masterclass',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background-color: #007bff; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">¡Hoy es el día!</h1>
    <p style="margin: 10px 0 0 0; font-size: 18px;">Masterclass en vivo - {{Hora}}</p>
  </div>

  <h2 style="color: #2c3e50;">Hola {{Nombre}},</h2>

  <p style="font-size: 18px;"><strong>La masterclass es HOY a las {{Hora}}.</strong></p>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="margin-top: 0; color: #2c3e50;">Detalles importantes:</h3>
    <ul style="line-height: 2;">
      <li><strong>Duración:</strong> Aproximadamente 90 minutos</li>
      <li><strong>Formato:</strong> En vivo (no es grabado)</li>
      <li><strong>Requisitos:</strong> Conexión estable y ganas de aprender</li>
    </ul>
  </div>

  <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0; font-size: 16px;"><strong>📌 Te voy a mandar el enlace 1 hora antes del evento.</strong></p>
    <p style="margin: 10px 0 0 0;">Revisa tu bandeja de entrada y spam.</p>
  </div>

  <h3 style="color: #2c3e50;">Qué llevar preparado:</h3>
  <ul style="line-height: 1.8;">
    <li>Libreta y lapicero (sí, físicos, no digital)</li>
    <li>Preguntas sobre tu idea de SaaS (si ya tienes una)</li>
    <li>Mente abierta para cuestionar lo que te han enseñado</li>
  </ul>

  <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
    <p style="margin: 0;"><strong>⏰ Conéctate 5 minutos antes.</strong> Vamos a empezar puntual.</p>
  </div>

  <p style="font-size: 18px; margin-top: 30px;"><strong>Nos vemos en unas horas.</strong></p>

  <p style="margin-top: 30px;">
    El equipo de KaledSoft
  </p>

</body>
</html>
    `,
    variables: ['Nombre', 'Hora'],
    category: 'AUTOMATIC',
    phase: 'FASE_2',
    isLibraryTemplate: true,
  },

  {
    name: 'Fase 2 - Email 5: 1 Hora Antes',
    subject: 'Empezamos en 1 hora ⏰',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background-color: #dc3545; color: white; padding: 40px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 36px;">⏰ 1 HORA</h1>
    <p style="margin: 15px 0 0 0; font-size: 20px;">La masterclass empieza en 60 minutos</p>
  </div>

  <h2 style="color: #2c3e50; text-align: center;">{{Nombre}}, aquí está tu enlace:</h2>

  <div style="text-align: center; margin: 40px 0;">
    <a href="{{Enlace}}" style="display: inline-block; background-color: #28a745; color: white; padding: 20px 40px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: bold;">
      🎯 ENTRAR A LA MASTERCLASS
    </a>
  </div>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <p style="margin: 0; font-size: 16px;">Enlace directo (por si el botón no funciona):</p>
    <p style="margin: 10px 0 0 0; word-break: break-all;"><a href="{{Enlace}}" style="color: #007bff;">{{Enlace}}</a></p>
  </div>

  <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
    <p style="margin: 0;"><strong>💡 Consejo:</strong> Entra 5 minutos antes para verificar audio y video.</p>
  </div>

  <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="margin-top: 0; color: #0c5460;">Recordatorio rápido:</h3>
    <ul style="line-height: 1.8; margin-bottom: 0;">
      <li>Vamos a construir en vivo (no es PowerPoint)</li>
      <li>Habrá espacio para preguntas al final</li>
      <li>Voy a presentar el programa completo</li>
      <li>No hay replay - solo en vivo</li>
    </ul>
  </div>

  <p style="text-align: center; font-size: 20px; margin-top: 40px;"><strong>Te espero adentro 🚀</strong></p>

  <p style="text-align: center; margin-top: 30px;">
    El equipo de KaledSoft
  </p>

</body>
</html>
    `,
    variables: ['Nombre', 'Enlace'],
    category: 'AUTOMATIC',
    phase: 'FASE_2',
    isLibraryTemplate: true,
  },

  // ============================================
  // FASE 3: Post-Masterclass Attended (4 emails)
  // ============================================
  {
    name: 'Fase 3 - Email 6: Oferta Inmediata',
    subject: 'Si quieres entrar, este es el siguiente paso',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <h2 style="color: #2c3e50;">Hola {{Nombre}},</h2>

  <p>Gracias por quedarte hasta el final de la masterclass.</p>

  <p>Ya sabes de qué va el programa:</p>

  <ul style="line-height: 1.8; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
    <li><strong>4 meses</strong> de construcción intensiva</li>
    <li><strong>Acompañamiento 1 a 1</strong> hasta publicar tu SaaS</li>
    <li><strong>Garantía:</strong> seguimos contigo gratis hasta que publiques</li>
    <li><strong>Inversión:</strong> $1,000,000 COP</li>
  </ul>

  <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="margin-top: 0; color: #155724;">Si estás listo para empezar:</h3>
    <p style="margin-bottom: 15px;">Tienes 2 opciones:</p>

    <div style="background-color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
      <h4 style="margin-top: 0; color: #2c3e50;">Opción 1: Pago directo</h4>
      <p style="margin-bottom: 10px;">Separa tu cupo ahora y empieza el próximo lunes.</p>
      <a href="{{LinkPago}}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        💳 Ir al checkout
      </a>
    </div>

    <div style="background-color: white; padding: 15px; border-radius: 8px;">
      <h4 style="margin-top: 0; color: #2c3e50;">Opción 2: Agenda una llamada</h4>
      <p style="margin-bottom: 10px;">Si tienes preguntas o necesitas hablar de facilidades de pago.</p>
      <a href="{{LinkCalendly}}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        📞 Agendar llamada
      </a>
    </div>
  </div>

  <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
    <p style="margin: 0;"><strong>⚠️ Importante:</strong> Solo abrimos 15 cupos por cohorte. Cuando se llenen, toca esperar al siguiente grupo (8 semanas).</p>
  </div>

  <h3 style="color: #2c3e50;">Preguntas frecuentes:</h3>

  <div style="margin: 20px 0;">
    <p style="font-weight: bold; margin-bottom: 5px;">¿Necesito saber programar?</p>
    <p style="margin-top: 5px;">No. Empezamos desde cero. Lo importante es que tengas ganas de aprender.</p>
  </div>

  <div style="margin: 20px 0;">
    <p style="font-weight: bold; margin-bottom: 5px;">¿Cuándo empieza?</p>
    <p style="margin-top: 5px;">El próximo lunes. Las inscripciones cierran este viernes.</p>
  </div>

  <div style="margin: 20px 0;">
    <p style="font-weight: bold; margin-bottom: 5px;">¿Qué pasa si no puedo terminar en 4 meses?</p>
    <p style="margin-top: 5px;">Seguimos contigo sin costo adicional hasta que publiques tu SaaS. Es nuestra garantía.</p>
  </div>

  <p style="margin-top: 40px;">Si tienes más preguntas, responde este email o agenda una llamada.</p>

  <p style="margin-top: 30px;">
    Nos vemos adentro,<br>
    <strong>El equipo de KaledSoft</strong>
  </p>

</body>
</html>
    `,
    variables: ['Nombre', 'LinkPago', 'LinkCalendly'],
    category: 'AUTOMATIC',
    phase: 'FASE_3',
    isLibraryTemplate: true,
  },

  {
    name: 'Fase 3 - Email 7: Urgencia Suave',
    subject: 'Ya hay cupos reservados',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <h2 style="color: #2c3e50;">{{Nombre}},</h2>

  <p>Te escribo rápido para actualizarte:</p>

  <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <p style="margin: 0; font-size: 20px; font-weight: bold; color: #856404;">Ya se reservaron 8 de los 15 cupos.</p>
  </div>

  <p>No te quiero presionar, pero sí quiero que sepas que <strong>cuando se llenen los 15 cupos, cerramos inscripciones</strong>.</p>

  <p>Y la siguiente cohorte empieza en 8 semanas.</p>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <h3 style="margin-top: 0; color: #2c3e50;">Si todavía estás pensándolo:</h3>
    <p>Estas son las dudas más comunes que nos escriben:</p>

    <div style="margin: 20px 0;">
      <p style="font-weight: bold; margin-bottom: 5px; color: #2c3e50;">💰 "No tengo el dinero completo ahora"</p>
      <p style="margin-top: 5px;">Tenemos opciones de pago. Agenda una llamada y lo hablamos → <a href="{{Link}}" style="color: #007bff;">Agendar aquí</a></p>
    </div>

    <div style="margin: 20px 0;">
      <p style="font-weight: bold; margin-bottom: 5px; color: #2c3e50;">⏰ "No sé si tendré tiempo"</p>
      <p style="margin-top: 5px;">Necesitas mínimo 10 horas a la semana. Si no las tienes, mejor esperar. Pero si las tienes, no necesitas más.</p>
    </div>

    <div style="margin: 20px 0;">
      <p style="font-weight: bold; margin-bottom: 5px; color: #2c3e50;">🤔 "No sé si soy capaz"</p>
      <p style="margin-top: 5px;">El 90% de nuestros alumnos nunca habían programado antes. Si tienes ganas de aprender, eres capaz.</p>
    </div>

    <div style="margin: 20px 0;">
      <p style="font-weight: bold; margin-bottom: 5px; color: #2c3e50;">🎯 "No tengo idea de qué SaaS construir"</p>
      <p style="margin-top: 5px;">Parte del programa es ayudarte a encontrar esa idea. No necesitas llegar con ella resuelta.</p>
    </div>
  </div>

  <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0; font-weight: bold; color: #0c5460;">💬 ¿Tienes otra duda?</p>
    <p style="margin: 10px 0 0 0;">Responde este email o agenda una llamada. Te resolvemos todo.</p>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="{{Link}}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
      📞 Agendar llamada
    </a>
  </div>

  <p style="margin-top: 30px;">
    Un saludo,<br>
    <strong>El equipo de KaledSoft</strong>
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
    <p>PD: Si ya decidiste que no es para ti, no problem. Te deseo el mejor éxito en lo que sea que hagas. Pero si la duda es solo miedo... dale. El miedo se pasa construyendo.</p>
  </div>

</body>
</html>
    `,
    variables: ['Nombre', 'Link'],
    category: 'AUTOMATIC',
    phase: 'FASE_3',
    isLibraryTemplate: true,
  },

  {
    name: 'Fase 3 - Email 8: Objeción Económica',
    subject: '"No tengo el dinero ahora"',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <h2 style="color: #2c3e50;">{{Nombre}},</h2>

  <p>Sé que $1,000,000 no es poco dinero.</p>

  <p>Especialmente si eres estudiante o recién graduado.</p>

  <p>Lo entiendo perfectamente.</p>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0;">Por eso quiero que pienses en esto de otra forma:</p>
  </div>

  <h3 style="color: #2c3e50;">No es un gasto. Es una apuesta a ti mismo.</h3>

  <p>Compara las opciones:</p>

  <div style="background-color: #fff; border: 2px solid #dc3545; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h4 style="margin-top: 0; color: #dc3545;">❌ Opción 1: Seguir como estás</h4>
    <ul style="line-height: 1.8;">
      <li>Terminar la carrera en 2-3 años más</li>
      <li>Salir sin experiencia real</li>
      <li>Buscar trabajo como junior ($2-3M/mes si tienes suerte)</li>
      <li>Depender de que te contraten</li>
      <li>Costo: 2+ años de tu vida + matrícula universitaria</li>
    </ul>
  </div>

  <div style="background-color: #fff; border: 2px solid #28a745; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h4 style="margin-top: 0; color: #28a745;">✅ Opción 2: Construir tu propio SaaS</h4>
    <ul style="line-height: 1.8;">
      <li>En 4 meses tienes un producto publicado</li>
      <li>Aprendes haciendo, no memorizando</li>
      <li>Tienes algo real en tu portafolio</li>
      <li>Puedes venderlo, escalarlo o usarlo para conseguir mejores trabajos</li>
      <li>Costo: $1M + 4 meses de trabajo</li>
    </ul>
  </div>

  <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #155724;">Pregunta honesta:</p>
    <p style="margin: 10px 0 0 0;">¿Cuánto tiempo te tomaría ganar $1M si sigues el camino tradicional vs. si tienes un SaaS funcionando?</p>
  </div>

  <h3 style="color: #2c3e50;">Sobre las facilidades de pago:</h3>

  <p>Tenemos opciones. No puedo prometerte algo específico sin hablar contigo, pero <strong>queremos que entres si de verdad quieres estar</strong>.</p>

  <p>El dinero no debería ser la única barrera.</p>

  <div style="text-align: center; margin: 40px 0;">
    <a href="{{Link}}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
      Hablemos de opciones de pago
    </a>
  </div>

  <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
    <p style="margin: 0;"><strong>Recordatorio:</strong> Solo quedan 7 cupos. Las inscripciones cierran el viernes.</p>
  </div>

  <p style="margin-top: 40px;">Si de verdad quieres construir tu SaaS, encontremos la forma.</p>

  <p style="margin-top: 30px;">
    Agenda una llamada y hablamos,<br>
    <strong>El equipo de KaledSoft</strong>
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
    <p>PD: Si definitivamente no puedes ahora, entiendo. Pero guarda este email. Cuando estés listo, escríbenos. Hacemos nuevas cohortes cada 2 meses.</p>
  </div>

</body>
</html>
    `,
    variables: ['Nombre', 'Link'],
    category: 'AUTOMATIC',
    phase: 'FASE_3',
    isLibraryTemplate: true,
  },

  {
    name: 'Fase 3 - Email 9: Último Aviso',
    subject: 'Cerramos hoy',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background-color: #dc3545; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 32px;">⏰ ÚLTIMO DÍA</h1>
    <p style="margin: 15px 0 0 0; font-size: 18px;">Cerramos inscripciones esta noche</p>
  </div>

  <h2 style="color: #2c3e50;">{{Nombre}},</h2>

  <p>Este es el último email.</p>

  <p><strong>Hoy a medianoche cerramos inscripciones.</strong></p>

  <p>Ya no quedan cupos. Los últimos 3 se llenan hoy.</p>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0;">Si estás leyendo esto, significa que te interesó la masterclass pero no te inscribiste todavía.</p>
  </div>

  <p>Puede ser por varias razones:</p>

  <ul style="line-height: 1.8;">
    <li>Estás esperando "el momento perfecto" (que nunca llega)</li>
    <li>Tienes miedo de no ser capaz (spoiler: eres capaz)</li>
    <li>No tienes el dinero (hay opciones de pago)</li>
    <li>Simplemente no es para ti (y está bien)</li>
  </ul>

  <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
    <p style="margin: 0; font-weight: bold;">Solo tú sabes cuál es tu razón.</p>
  </div>

  <p>Si es la última (no es para ti), te deseo el mejor éxito en lo que sea que hagas. En serio.</p>

  <p>Pero si es una de las otras tres...</p>

  <div style="background-color: #d1ecf1; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <p style="margin: 0; font-size: 20px; font-weight: bold; color: #0c5460;">Tienes hasta medianoche para decidir.</p>
    <p style="margin: 15px 0 0 0;">Después de eso, toca esperar 8 semanas a la siguiente cohorte.</p>
  </div>

  <h3 style="color: #2c3e50;">Lo que pasa si entras hoy:</h3>

  <ul style="line-height: 1.8; background-color: #d4edda; padding: 20px; border-radius: 8px;">
    <li>✅ Empiezas el lunes que viene</li>
    <li>✅ En 4 meses tienes tu SaaS publicado</li>
    <li>✅ Aprendes más que en 2 años de universidad</li>
    <li>✅ Tienes acompañamiento 1 a 1 hasta lograrlo</li>
    <li>✅ Garantía: seguimos contigo gratis hasta que publiques</li>
  </ul>

  <h3 style="color: #2c3e50;">Lo que pasa si no entras:</h3>

  <ul style="line-height: 1.8; background-color: #f8d7da; padding: 20px; border-radius: 8px;">
    <li>❌ Esperas 8 semanas a la siguiente cohorte</li>
    <li>❌ Sigues en la misma situación que ahora</li>
    <li>❌ Dentro de 4 meses mirarás atrás y dirás "debí haberlo hecho"</li>
  </ul>

  <div style="text-align: center; margin: 40px 0;">
    <a href="{{LinkInscripcion}}" style="display: inline-block; background-color: #28a745; color: white; padding: 20px 50px; text-decoration: none; border-radius: 8px; font-size: 20px; font-weight: bold;">
      🚀 SÍ, QUIERO MI CUPO
    </a>
  </div>

  <div style="background-color: #fff; border: 2px solid #007bff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <p style="margin: 0; font-weight: bold; color: #0c5460;">¿Tienes dudas de última hora?</p>
    <p style="margin: 10px 0 0 0;">Responde este email. Te contesto hoy mismo.</p>
  </div>

  <p style="margin-top: 40px; font-size: 18px; text-align: center;"><strong>La decisión es tuya.</strong></p>

  <p style="margin-top: 30px; text-align: center;">
    Nos vemos (o no),<br>
    <strong>El equipo de KaledSoft</strong>
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
    <p>PD: Este es el último email de esta campaña. Si no entras hoy, te eliminamos de la lista. Si más adelante quieres información de la siguiente cohorte, tendrás que escribirnos de nuevo.</p>
  </div>

</body>
</html>
    `,
    variables: ['Nombre', 'LinkInscripcion'],
    category: 'AUTOMATIC',
    phase: 'FASE_3',
    isLibraryTemplate: true,
  },

  // ============================================
  // FASE 4: No-Show Recovery (2 emails)
  // ============================================
  {
    name: 'Fase 4 - Email NS-1: Te lo Perdiste',
    subject: 'No apareciste',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <h2 style="color: #2c3e50;">Hola {{Nombre}},</h2>

  <p>Te esperamos en la masterclass, pero no apareciste.</p>

  <p>No sé si fue por:</p>
  <ul>
    <li>Se te olvidó</li>
    <li>Tuviste un imprevisto</li>
    <li>Decidiste que no era para ti</li>
  </ul>

  <p>Sea cual sea la razón, no problem.</p>

  <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0; font-weight: bold; color: #0c5460;">Grabamos la masterclass completa.</p>
    <p style="margin: 10px 0 0 0;">Puedes verla aquí durante las próximas 48 horas:</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{{LinkGrabacion}}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
      ▶️ Ver grabación
    </a>
  </div>

  <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
    <p style="margin: 0;"><strong>⏰ Importante:</strong> La grabación se elimina en 48 horas. Después de eso ya no estará disponible.</p>
  </div>

  <h3 style="color: #2c3e50;">Qué vas a ver en la grabación:</h3>

  <ul style="line-height: 1.8; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
    <li>Construcción de un SaaS en vivo (con código real)</li>
    <li>Cómo usar IA para escribir código que funciona</li>
    <li>Los 3 errores que matan proyectos antes de nacer</li>
    <li>Presentación completa del programa de 4 meses</li>
    <li>Precios, garantías y próximos pasos</li>
  </ul>

  <p style="margin-top: 30px;">Si después de verla te interesa el programa, puedes:</p>

  <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0;">
    <p style="margin: 0;"><strong>1.</strong> Inscribirte directamente (si aún hay cupos)</p>
    <p style="margin: 10px 0 0 0;"><strong>2.</strong> Agendar una llamada para resolver dudas</p>
    <p style="margin: 10px 0 0 0;"><strong>3.</strong> Responder este email con tus preguntas</p>
  </div>

  <p>Pero primero, ve la grabación.</p>

  <div style="text-align: center; margin: 40px 0;">
    <a href="{{LinkGrabacion}}" style="display: inline-block; background-color: #28a745; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
      ▶️ Ver ahora
    </a>
  </div>

  <p style="margin-top: 30px;">
    Un saludo,<br>
    <strong>El equipo de KaledSoft</strong>
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
    <p>Recuerda: 48 horas. Después de eso, la grabación se elimina y tendrías que esperar a la siguiente masterclass en vivo (8 semanas).</p>
  </div>

</body>
</html>
    `,
    variables: ['Nombre', 'LinkGrabacion'],
    category: 'AUTOMATIC',
    phase: 'NO_SHOW',
    isLibraryTemplate: true,
  },

  {
    name: 'Fase 4 - Email NS-2: Última Oportunidad Grabación',
    subject: 'La grabación se elimina hoy ⏰',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background-color: #dc3545; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">⏰ ÚLTIMA OPORTUNIDAD</h1>
    <p style="margin: 15px 0 0 0; font-size: 16px;">La grabación se elimina esta noche</p>
  </div>

  <h2 style="color: #2c3e50;">{{Nombre}},</h2>

  <p>Aviso rápido:</p>

  <p><strong>Hoy a medianoche eliminamos la grabación de la masterclass.</strong></p>

  <p>No sé si ya la viste o no. Pero si no lo hiciste, este es tu último chance.</p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{{Link}}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
      ▶️ Ver grabación ahora
    </a>
  </div>

  <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0;">
    <p style="margin: 0;">Después de esta noche, si quieres ver el contenido, tendrías que esperar a la siguiente masterclass en vivo (8 semanas).</p>
  </div>

  <p>Si ya la viste y decidiste que no es para ti, perfecto. Te deseo el mejor éxito.</p>

  <p>Si la viste y te interesa el programa, hay 2 cupos disponibles todavía. Responde este email o ve directo al checkout.</p>

  <p>Si NO la has visto, hoy es tu día.</p>

  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
    <p style="margin: 0; font-size: 16px;">Enlace directo:</p>
    <p style="margin: 10px 0 0 0; word-break: break-all;"><a href="{{Link}}" style="color: #007bff;">{{Link}}</a></p>
  </div>

  <p style="margin-top: 40px; text-align: center; font-size: 18px;"><strong>Nos vemos (o no).</strong></p>

  <p style="margin-top: 30px; text-align: center;">
    El equipo de KaledSoft
  </p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
    <p>Este es el último email. Si no ves la grabación hoy, te eliminamos de la lista. Si en el futuro quieres información del programa, tendrás que escribirnos de nuevo.</p>
  </div>

</body>
</html>
    `,
    variables: ['Nombre', 'Link'],
    category: 'AUTOMATIC',
    phase: 'NO_SHOW',
    isLibraryTemplate: true,
  },
];

async function seedEmailTemplates() {
  console.log('🌱 Seeding email templates...\n');

  for (const template of emailTemplates) {
    try {
      await prisma.kaledEmailTemplate.upsert({
        where: { name: template.name },
        update: template,
        create: template,
      });
      console.log(`✅ Created/Updated: ${template.name}`);
    } catch (error) {
      console.error(`❌ Error with ${template.name}:`, error);
    }
  }

  console.log('\n✨ Email templates seeded successfully!\n');
}

seedEmailTemplates()
  .catch((e) => {
    console.error('❌ Error seeding templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
