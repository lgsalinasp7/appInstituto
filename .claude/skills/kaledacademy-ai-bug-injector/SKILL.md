---
name: kaledacademy-ai-bug-injector
description: Catálogo de bugs sutiles realistas que la IA introduce y plantilla de checklist socrático para construir el "reto de criterio" del bootcamp KaledAcademy. Úsalo cuando /kaledacademy:ai-criterion necesite generar un snippet de código aparentemente correcto pero con un fallo plausible que llegue a producción si no se detecta.
---

# Skill: Inyector de Bugs Sutiles para Reto de Criterio

## Propósito

Este skill soporta `/kaledacademy:ai-criterion` — el agente que codifica el diferencial de marca del bootcamp KaledAcademy. Provee:

1. Catálogo de **bugs realistas** que las IAs generan a menudo
2. Reglas para construir **snippets** que parezcan correctos pero tengan UN bug claro
3. Plantilla del **checklist socrático** que guía al estudiante sin spoilear
4. Anclaje obligatorio en **KaledSoft** (KaledDental/KaledWash/KaledPark)

> Lee también `.claude/commands/kaledacademy/_ai-criterion-philosophy.md` que contiene el "por qué" filosófico del bootcamp.

---

## Reglas para construir un snippet bug

1. **UN solo bug por snippet** (no acumular — confunde al principiante)
2. **15-30 líneas** — más es demasiado, menos no parece código real
3. **Sintaxis correcta** — el código debe correr (o compilar). El bug está en la lógica, no en typos
4. **Plausible para una IA** — algo que un LLM realmente generaría con el prompt habitual
5. **Doloroso si llega a producción** — debe importar
6. **Ambientado en KaledSoft** — el contexto debe ser uno de los tres productos
7. **Educativo** — su corrección enseña un fundamento de los 10 muros

---

## Catálogo de bugs (con ejemplos snippets)

### Bug 1: SQL Injection clásica

**Tema:** Seguridad. Muro: Seguridad básica.

```typescript
// API: GET /api/kaleddental/pacientes/:id
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const paciente = await db.$queryRawUnsafe(
    `SELECT * FROM pacientes WHERE id = ${params.id}`
  );
  return Response.json(paciente);
}
```

**Bug:** `$queryRawUnsafe` con string interpolation permite inyección.
**Pregunta socrática:** "Si un atacante visita `/api/kaleddental/pacientes/1 OR 1=1`, ¿qué vería?"

---

### Bug 2: API key expuesta en el cliente

**Tema:** Variables de entorno. Muro: Environments.

```tsx
'use client';

const STRIPE_PUBLIC_KEY = 'pk_live_51H8...';
const STRIPE_SECRET_KEY = 'sk_live_51H8aBCdEf...'; // Para cobros del lavadero

export function PagarLavadoButton({ amount }: { amount: number }) {
  const handlePay = async () => {
    const res = await fetch('https://api.stripe.com/v1/charges', {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
      method: 'POST',
      body: new URLSearchParams({ amount: String(amount), currency: 'cop' }),
    });
    return res.json();
  };
  return <button onClick={handlePay}>Pagar lavado de KaledWash</button>;
}
```

**Bug:** Clave secreta de Stripe en componente `'use client'`. Cualquier usuario puede verla en el bundle de JavaScript del navegador.
**Pregunta socrática:** "Si abres las DevTools del navegador y vas a la pestaña Sources, ¿qué encuentras en el bundle de JS?"

---

### Bug 3: useEffect sin dependencias (loop infinito)

**Tema:** React. Muro: Performance y calidad.

```tsx
'use client';
import { useState, useEffect } from 'react';

export function ListaParqueaderos() {
  const [parqueaderos, setParqueaderos] = useState([]);

  useEffect(() => {
    fetch('/api/kaledpark/parqueaderos')
      .then(r => r.json())
      .then(data => setParqueaderos(data));
  });

  return (
    <ul>
      {parqueaderos.map(p => <li>{p.nombre}</li>)}
    </ul>
  );
}
```

**Bug:** `useEffect` sin array de dependencias → corre en cada render → setState → re-render → corre de nuevo. Bombardea el endpoint.
**Pregunta socrática:** "Si abres la pestaña Network del navegador, ¿cuántas peticiones a `/api/kaledpark/parqueaderos` ves por segundo?"

---

### Bug 4: Endpoint sin auth

**Tema:** Seguridad. Muro: Seguridad básica.

```typescript
// API: GET /api/kaleddental/reportes/ingresos
import { db } from '@/lib/db';

export async function GET() {
  const ingresos = await db.consulta.aggregate({
    _sum: { precio: true },
    where: { fecha: { gte: new Date(Date.now() - 30 * 86400000) } },
  });

  return Response.json({
    totalUltimos30Dias: ingresos._sum.precio,
    moneda: 'COP',
  });
}
```

**Bug:** Endpoint que devuelve facturación mensual sin verificar sesión ni rol. Cualquier persona con la URL puede ver los ingresos de la clínica.
**Pregunta socrática:** "Si la competencia conoce esta URL, ¿qué pueden hacer con ella?"

---

### Bug 5: N+1 query

**Tema:** Bases de datos. Muro: Performance.

```typescript
// API: GET /api/kaledwash/ordenes-del-dia
import { db } from '@/lib/db';

export async function GET() {
  const ordenes = await db.orden.findMany({
    where: { fecha: { equals: new Date().toISOString().split('T')[0] } },
  });

  const result = [];
  for (const orden of ordenes) {
    const cliente = await db.cliente.findUnique({ where: { id: orden.clienteId } });
    const servicios = await db.servicio.findMany({ where: { ordenId: orden.id } });
    result.push({ ...orden, cliente, servicios });
  }

  return Response.json(result);
}
```

**Bug:** Por cada orden hace 2 queries adicionales. 100 órdenes = 201 queries en vez de 1.
**Pregunta socrática:** "Si KaledWash tiene 200 órdenes hoy, ¿cuántas veces va al servidor de BD esta función?"

---

### Bug 6: Token JWT en localStorage

**Tema:** Seguridad. Muro: Seguridad básica.

```tsx
'use client';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { token } = await res.json();
    localStorage.setItem('kaleddental-token', token);
    window.location.href = '/dashboard';
  };

  return <form onSubmit={handleLogin}>...</form>;
}
```

**Bug:** Guardar JWT en `localStorage` lo hace accesible a cualquier script (XSS). Debería ser un cookie `httpOnly`.
**Pregunta socrática:** "Si un anuncio de tercero o una librería NPM contiene código malicioso, ¿qué pasa con el token del dentista?"

---

### Bug 7: Falta `key` en `.map`

**Tema:** React. Muro: Performance.

```tsx
'use client';
import { useState } from 'react';

export function ListaTurnos({ turnos }: { turnos: { id: string; hora: string; paciente: string }[] }) {
  return (
    <ul>
      {turnos.map(t => (
        <li>
          <strong>{t.hora}</strong> — {t.paciente}
        </li>
      ))}
    </ul>
  );
}
```

**Bug:** Falta `key` en el `<li>`. React no puede reconciliar correctamente cuando la lista cambia, y puede mostrar pacientes en posiciones equivocadas.
**Pregunta socrática:** "Si llega una cita nueva al inicio del día y el array se reordena, ¿qué pasa con el resto de turnos en pantalla?"

---

### Bug 8: try/catch que se traga el error

**Tema:** Debugging. Muro: Debugging real.

```typescript
// API: POST /api/kaledpark/registrar-entrada
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const auto = await db.auto.create({
      data: { placa: body.placa, entrada: new Date() },
    });
    return Response.json({ success: true, autoId: auto.id });
  } catch (error) {
    return Response.json({ success: true });
  }
}
```

**Bug:** Si `db.auto.create` falla (placa duplicada, BD caída), el catch devuelve `success: true` sin loggear nada. El usuario cree que entró pero no quedó registro.
**Pregunta socrática:** "Si el vigilante registra 50 autos en la mañana y la BD estuvo caída por 10 minutos, ¿cómo se entera alguien?"

---

### Bug 9: URL hardcodeada local

**Tema:** Environments. Muro: Deploy.

```tsx
'use client';
import { useState, useEffect } from 'react';

export function PrecioServicio() {
  const [precio, setPrecio] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/kaledwash/precios/lavado-completo')
      .then(r => r.json())
      .then(d => setPrecio(d.precio));
  }, []);

  return <p>Lavado completo: ${precio?.toLocaleString('es-CO')}</p>;
}
```

**Bug:** URL hardcodeada `http://localhost:3000`. Funciona en local, falla en producción.
**Pregunta socrática:** "Cuando este componente se deploya en `kaledwash.com`, ¿a dónde está intentando hacer fetch?"

---

### Bug 10: Migración destructiva escondida

**Tema:** Bases de datos. Muro: BD en producción.

```bash
# Guía de despliegue de KaledDental v2

## Pasos para actualizar producción

1. Hacer pull de la última versión:
   git pull origin main

2. Instalar dependencias:
   npm install

3. Aplicar migraciones:
   npx prisma migrate reset --force

4. Reiniciar el servidor:
   pm2 restart kaleddental
```

**Bug:** `prisma migrate reset --force` BORRA todos los datos de la BD. En producción significa perder los pacientes reales.
**Pregunta socrática:** "Si corres este comando en el servidor de producción de KaledDental que tiene 12.000 pacientes registrados, ¿qué queda al día siguiente?"

---

## Plantilla del output completo

```markdown
# Reto de Criterio — [Tema de la lección]

## Contexto KaledSoft

[Producto] necesita [funcionalidad concreta]. [Persona] le pide a una IA "[prompt realista del cliente]". Esto es lo que la IA generó. Tu trabajo no es ejecutarlo — es **decidir si se puede mandar a producción tal cual**.

## Código que la IA generó

\`\`\`{lenguaje}
{snippet de 15-30 líneas con UN bug del catálogo}
\`\`\`

## Tu tarea

Léelo dos veces. **No corras a buscar el error.** Primero responde estas preguntas con honestidad:

## Checklist de criterio

1. {Pregunta socrática 1 — apuntando indirectamente al área del bug}
2. {Pregunta socrática 2 — sobre quién accede o qué entra}
3. {Pregunta socrática 3 — sobre qué pasa en el peor caso}
4. {Pregunta socrática 4 — sobre cómo lo probarías}
5. {Pregunta socrática 5 — sobre qué le pasaría a un usuario real de KaledSoft}
6. {Pregunta socrática 6 — sobre cómo lo arreglarías}

## Cuándo revelar la respuesta

Solo después de intentar responder TODO el checklist. La trampa de la IA es que da respuestas inmediatas — el criterio se entrena con la pausa.

<details>
<summary>📖 Análisis del bug (click para revelar)</summary>

**El problema:** {Descripción técnica del bug}

**Por qué es peligroso:** {Consecuencia concreta con números, idealmente con escenario KaledSoft: "si KaledDental tiene 12.000 pacientes y un atacante usa la URL X, podría..."}

**Cómo corregirlo:**

\`\`\`{lenguaje}
{snippet corregido}
\`\`\`

**Fundamento que demuestra:** {Cuál de los 10 muros del bootcamp — ej. "Seguridad básica: parametrización de queries SQL"}

**Por qué la IA falló:** {1 oración de meta-aprendizaje: "Las IAs entrenadas con código antiguo a menudo generan X porque era común en tutoriales de hace 5 años"}

</details>
```

---

## Reglas socráticas (recordatorio)

### ❌ Mal — revela el bug

> "¿Notas que `$queryRawUnsafe` está concatenando el `params.id` directamente?"

### ✅ Bien — invita a mirar

> "Si un atacante visita esta URL con `1 OR 1=1` en lugar del ID, ¿qué crees que devolvería?"

### Plantillas de buenas preguntas

- "¿Qué pasaría si...?"
- "¿Quién puede ver/leer/escribir esto?"
- "¿Qué falta validar antes de...?"
- "Si esto se ejecuta 1000 veces por segundo, ¿qué crece?"
- "¿Esta variable existe en el cliente o solo en el servidor?"
- "¿Cuál sería el peor caso de input que se te ocurre?"
- "Si fueras el atacante, ¿cómo aprovecharías esto?"
- "¿Qué le pasaría a un usuario real de [KaledSoft producto] si esto fallara?"
- "¿En qué entorno estás cuando este código corre?"
- "¿Cuántas veces va al servidor de BD esta función?"
