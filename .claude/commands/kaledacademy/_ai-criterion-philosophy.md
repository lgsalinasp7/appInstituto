# Filosofía del Reto de Criterio sobre IA

> Este archivo es leído por `/kaledacademy:ai-criterion`. Codifica el **diferencial de marca** del bootcamp KaledAcademy en patrones concretos.

---

## El pitch

> **"La IA escribe el código. Tú tienes que saber si está bien escrito."**
>
> "Cualquiera puede pedirle código a la IA. No cualquiera sabe qué hacer cuando ese código falla en producción."
>
> "El que no tiene fundamentos le cree todo a la IA. El que tiene fundamentos sabe cuándo la IA está mintiendo."

KaledAcademy no enseña a competir con la IA. Enseña a **dirigir la IA con criterio**. El "reto de criterio" de cada lección es **literalmente la operacionalización** de esta promesa: una vez por sesión, el estudiante recibe código que "una IA generó" y tiene que decidir si está bien o no.

Si fallas en este agente, el bootcamp pierde su diferencial.

---

## Los 10 muros que la IA NO resuelve

(Del documento `docs/academia/CONTEXTO-DE-COMO-ES-KALEDACADEMY.md`. Cada reto de criterio debería atacar al menos uno):

1. **Control de versiones** — La IA no entiende tu historial de Git ni tus ramas
2. **Colaboración en equipo** — La IA no resuelve conflictos de merge
3. **Environments y variables de entorno** — La IA hardcodea, expone secrets, mezcla dev y prod
4. **Deploy y hosting** — La IA no sabe en qué servicio vives
5. **Base de datos en producción** — La IA no entiende qué pasa con datos reales
6. **Debugging real** — La IA no lee tu stack trace local
7. **Seguridad básica** — SQL injection, XSS, rutas sin auth, contraseñas en plano
8. **Performance y calidad** — Re-renders innecesarios, queries sin índices, n+1
9. **Testing** — La IA no escribe los tests que cubren tu lógica de negocio
10. **Code reviews y estándares** — La IA no respeta tus convenciones

---

## Catálogo de bugs sutiles para inyectar

Cada reto debe contener **UN solo bug claro** (no varios — confunden) en código de 15-30 líneas. El bug debe ser:

- **Plausible** — algo que una IA realmente generaría
- **Sutil** — no obvio a primera vista
- **Doloroso si llega a producción**
- **Educativo** — su corrección enseña un fundamento

### Bugs de seguridad

| Bug | Cómo inyectarlo | Qué fundamento enseña |
|---|---|---|
| SQL injection clásica | `db.query("SELECT * FROM users WHERE id = " + req.params.id)` | Parametrización de queries |
| API key en el cliente | `const key = "sk-real-looking-key-123"` en componente React | Variables de entorno y separación cliente/servidor |
| Endpoint sin auth | Una API route que devuelve datos sensibles sin chequear sesión | Defensa en profundidad |
| Password en texto plano | `await db.user.create({ password: req.body.password })` | Hashing con bcrypt |
| CORS abierto | `Access-Control-Allow-Origin: *` en endpoint con datos | Mismo origen y allowlist |
| Token JWT en localStorage | `localStorage.setItem('token', jwt)` | XSS y httpOnly cookies |

### Bugs de performance / React

| Bug | Cómo inyectarlo | Qué fundamento enseña |
|---|---|---|
| `useEffect` sin dependencias | `useEffect(() => { fetch(...) })` sin `[]` | Loop infinito |
| Falta `key` en `.map` | `items.map(i => <li>{i.name}</li>)` | Reconciliación de React |
| Estado derivado en `useState` | Calcular algo que ya viene de props y guardarlo en useState | `useMemo` o cálculo directo |
| `useEffect` sin cleanup | Subscripción que nunca se desmonta | Memory leaks |
| Re-render por objeto inline | `<Component config={{ x: 1 }} />` | Referencias estables |

### Bugs de base de datos

| Bug | Cómo inyectarlo | Qué fundamento enseña |
|---|---|---|
| N+1 query | Loop que llama `prisma.x.findUnique()` por cada item | Joins / `include` |
| Migración destructiva | `prisma migrate reset` mencionado en una guía de "deploy" | Migraciones seguras |
| Query sin índice en columna grande | `where: { email }` sin `@@index` | Cómo crece el costo |
| Race condition en update | Update sin transacción cuando hay dos procesos compitiendo | Transacciones |

### Bugs de environments / deploy

| Bug | Cómo inyectarlo | Qué fundamento enseña |
|---|---|---|
| `.env` commiteado | Snippet que dice "agrega tu `.env` al repo" | `.gitignore` |
| Secret hardcodeado en `next.config.js` | `STRIPE_KEY: "sk_live_xxx"` en config commiteado | Variables de entorno |
| URL hardcodeada local | `fetch("http://localhost:3000/api/...")` desde un componente desplegado | Variables relativas |
| Mismo `DATABASE_URL` para dev y prod | Comentario "esta env es la misma" | Separación de environments |

### Bugs de debugging / errores

| Bug | Cómo inyectarlo | Qué fundamento enseña |
|---|---|---|
| `try/catch` que se traga el error | `catch(e) {}` vacío | Logging y observabilidad |
| Status code incorrecto | API que devuelve `200` para errores | HTTP semántica |
| Mensaje genérico al usuario | "Algo salió mal" sin pista de qué | UX de errores |

---

## Estructura del reto de criterio (output esperado)

Cada reto generado por `/kaledacademy:ai-criterion` debe tener esta forma:

```markdown
# Reto de Criterio — [Tema de la lección]

## Contexto KaledSoft
[1 párrafo: KaledDental/KaledWash/KaledPark necesita X. Le pides a una IA que lo construya. Esto fue lo que generó:]

## Código que la IA generó
\`\`\`{lenguaje}
[15-30 líneas con UN bug sutil del catálogo]
\`\`\`

## Tu tarea
Léelo. No corras a buscar el error. Primero responde estas preguntas:

## Checklist de criterio
1. [Pregunta socrática 1 — guía sin spoilear]
2. [Pregunta socrática 2]
3. [Pregunta socrática 3]
4. [Pregunta socrática 4]
5. [Pregunta sobre qué pasaría si esto llegara a producción]
6. [Pregunta sobre cómo lo probarías para detectar el problema]

## Cuándo revelar la respuesta
Solo después de que el estudiante haya intentado responder TODO el checklist.

## Análisis del bug (oculto)
<details>
<summary>Click para ver la respuesta</summary>

**El problema:** [Descripción técnica clara del bug]

**Por qué es peligroso:** [Consecuencia concreta — preferentemente con métricas o ejemplo de KaledSoft]

**Cómo corregirlo:**
\`\`\`{lenguaje}
[Snippet corregido]
\`\`\`

**Fundamento que demuestra:** [Cuál de los 10 muros]
</details>
```

---

## Reglas socráticas para el checklist

Las preguntas del checklist NO deben ser respuestas disfrazadas. Deben ser **preguntas reales** que invitan al estudiante a mirar el código con criterio.

### ❌ Mal (revela el bug)

> "¿Notas que la query SQL está concatenando el `req.params.id`?"

### ✅ Bien (lo invita a mirar)

> "Si un usuario malicioso conoce esta URL, ¿qué podría escribir en lugar del ID para sacar más información de la que debería?"

### Plantillas de buenas preguntas socráticas

- "¿Qué pasaría si...?"
- "¿Quién puede ver/leer/escribir esto?"
- "¿Qué falta validar antes de...?"
- "Si esto se ejecuta 1000 veces por segundo, ¿qué crece?"
- "¿Qué ocurre si la red falla justo en el medio de...?"
- "¿Esta variable existe en el cliente o solo en el servidor?"
- "¿Cuál sería el peor caso de input que se te ocurre?"
- "Si fueras el atacante, ¿cómo aprovecharías esto?"
- "¿Qué le pasaría a un usuario real de KaledDental/KaledWash/KaledPark si esto fallara?"

---

## Anclaje obligatorio en KaledSoft

**Cada reto de criterio debe estar ambientado en uno de los tres productos.** No genera "una API genérica" — genera "el endpoint que muestra los pacientes de KaledDental" o "el componente que cobra el servicio de lavado en KaledWash".

Esto es importante porque:
1. Hace concreto el daño potencial
2. Refuerza el universo narrativo del bootcamp
3. Le da al estudiante un cliente/víctima imaginario por quien pelear

---

## Cuándo NO usar este agente

- En sesiones de la semana 1-2 donde el estudiante todavía no entiende sintaxis básica (no tiene contexto para juzgar)
- En lecciones de pura teoría histórica (historia del internet, evolución de JS, etc.) donde no hay código que evaluar
- Cuando el bug requiere conocer un concepto que aún no se ha enseñado (rompe la regla de oro del seed)

En esos casos, generar un reto de criterio sobre **proceso** en lugar de código: "una IA te dice que para hacer X tienes que hacer Y. ¿Qué le preguntarías antes de obedecer?"
