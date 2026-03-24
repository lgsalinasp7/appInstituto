# Asignación de profesores por email — qué se hizo y cómo probarlo

Guía paso a paso para entender los cambios y validarlos en local o en un entorno de pruebas.

---

## 1. Qué se implementó

### 1.1 API `POST /api/academy/cohorts/[id]/teachers`

**Archivo:** `src/app/api/academy/cohorts/[id]/teachers/route.ts`

- El cuerpo JSON puede llevar:
  - **`teacherEmail`**: email válido (Zod). El servidor busca en la base de datos un usuario del **mismo tenant** (`tenantId` de la sesión) con rol **`ACADEMY_TEACHER`** y ese email, **sin distinguir mayúsculas/minúsculas**.
  - **`teacherUserId`**: ID interno del usuario (cuid), como antes, para compatibilidad o soporte.
- Debe indicarse **al menos uno** de los dos; si falta ambos, responde **400** con mensaje de validación.
- Si se envía email y **no hay ningún profesor** con ese correo en el instituto → **404** con mensaje explícito.
- Solo rol **`ACADEMY_ADMIN`** puede hacer `POST` (igual que antes).

### 1.2 Pantalla de administración del curso

**Archivo:** `src/modules/academia/components/admin/AdminCourseManageView.tsx`

- En el modal **Profesores** (por cohorte):
  - El campo principal es un input de **correo** (placeholder `profesor@ejemplo.com`).
  - Al pulsar **Asignar**:
    - Si el texto contiene **`@`**, se envía `{ teacherEmail: "..." }`.
    - Si **no** contiene `@`, se envía `{ teacherUserId: "..." }` (se interpreta como cuid).
  - Tras asignar con éxito, se vacía el campo y se recarga la lista.
  - Al **cerrar** el modal, también se limpia el campo.
- En la lista de profesores asignados: si hay **nombre y email**, el email aparece en una segunda línea más pequeña.

---

## 2. Requisitos previos para probar

1. **Base de datos** con migraciones aplicadas (incluidas las de cohortes y `AcademyCohortTeacherAssignment` si aplica a tu rama).
2. **Aplicación en marcha**, por ejemplo `npm run dev`.
3. Un usuario **admin de academia** (`ACADEMY_ADMIN`) en el tenant donde pruebas.
4. Un usuario **profesor** (`ACADEMY_TEACHER`) en el **mismo tenant**, con un email que conozcas (puede crearse con seeds o manualmente).
5. Un **curso** con al menos una **cohorte** y acceso a la vista de gestión del curso donde se abre el modal de profesores.

---

## 3. Prueba manual en la interfaz (recomendada)

1. Inicia sesión como **admin de Kaled Academy** del instituto de prueba.
2. Navega hasta la **gestión del curso** donde están las cohortes (vista admin del curso en Academia).
3. Abre las acciones del cohorte que quieras y el modal **Profesores** (o el flujo equivalente que abre el diálogo “Profesores — [nombre cohorte]”).
4. Comprueba que aparece el texto de ayuda sobre correo / ID interno.
5. Escribe el **email exacto** del usuario con rol profesor (puedes probar mayúsculas distintas; debe resolverse igual).
6. Pulsa **Asignar**.
7. **Esperado:** toast de éxito, el profesor aparece en la lista (nombre o email; si hay ambos, email debajo).
8. Pulsa **Quitar** en ese profesor y confirma que desaparece de la lista.

### 3.1 Casos útiles adicionales

| Caso | Qué hacer | Resultado esperado |
|------|-----------|---------------------|
| Email inexistente o usuario sin rol profesor | Email que no exista o sea de un alumno/admin sin rol teacher | Error (404 o mensaje del API en toast) |
| Campo vacío | Asignar sin escribir nada | No hace la petición (no envía) |
| ID interno | Pegar el **cuid** del usuario (sin `@`) | Asignación por `teacherUserId` como antes |

---

## 4. Prueba directa del API (opcional)

Con sesión/cookies de admin válidas en el mismo origen, o con el mecanismo de auth que use tu app (Bearer, etc.), puedes llamar:

```http
POST /api/academy/cohorts/COHORTE_ID/teachers
Content-Type: application/json

{ "teacherEmail": "profesor@ejemplo.com" }
```

O por ID:

```json
{ "teacherUserId": "clxxxxxxxxxxxxxxxx" }
```

Respuestas típicas:

- **200** (o la que devuelva tu handler) con `success: true` si la asignación fue correcta.
- **400** si falta email e ID o el JSON no es válido.
- **404** si el cohorte no existe en el tenant o no hay profesor con ese email.
- **403** si el usuario no es `ACADEMY_ADMIN`.

---

## 5. Archivos tocados (referencia rápida)

| Archivo | Cambio |
|---------|--------|
| `src/app/api/academy/cohorts/[id]/teachers/route.ts` | Schema Zod + resolución por email + 404 claro |
| `src/modules/academia/components/admin/AdminCourseManageView.tsx` | Input email, payload condicional, ayuda, lista con email |

---

## 6. Si algo falla al generar Prisma en Windows

Si `npx prisma generate` devuelve **EPERM** al renombrar el motor de consultas, suele ser porque **otro proceso** (por ejemplo `npm run dev`) tiene el archivo bloqueado. Cierra el servidor de desarrollo, vuelve a ejecutar `prisma generate` y reinicia el dev server.
