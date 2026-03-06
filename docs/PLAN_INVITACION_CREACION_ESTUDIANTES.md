# Plan: Creación de estudiantes por invitación (Academia)

El flujo de invitación y creación de estudiantes de Academia es una **aplicación del patrón estándar** de autenticación e invitaciones por tenant descrito en [TENANT_AUTENTICACION_E_INVITACIONES.md](TENANT_AUTENTICACION_E_INVITACIONES.md): misma API (`POST /api/invitations`, `GET/POST /api/invitations/accept`), mismo flujo de aceptación y mismo login por tenant. La diferencia es el rol de Academia (ACADEMY_STUDENT, etc.) y la UI específica en Academia → Usuarios.

**Objetivo:** Que el administrador de Academia pueda invitar estudiantes, enviar correo de invitación y que el estudiante valide y cree su usuario en el tenant correspondiente.

---

## Estado actual

### Lo que ya existe

| Pieza | Ubicación | Estado |
|-------|-----------|--------|
| **Crear invitación** | Configuración → Usuarios → botón "Invitar Usuario" | Funciona: abre `InviteUserModal`, envía `POST /api/invitations` |
| **API crear invitación** | `POST /api/invitations` | Crea invitación, valida email/rol/límites, envía correo |
| **Email** | `sendInvitationEmail()` en `lib/email.ts` | Envía link con token (7 días) |
| **Validar token** | `GET /api/invitations/accept?token=xxx` | Devuelve datos de la invitación (email, rol, tenant, inviter) |
| **Aceptar y crear usuario** | `POST /api/invitations/accept` + página `/auth/invitation/[token]` | Crea usuario en el tenant con `platformRole` (ACADEMY_STUDENT, etc.) |

### Lo que no se ve / falta (actualizado)

1. **Academia → Usuarios** (`/academia/admin/users`): ~~solo muestra lista de estudiantes~~ **Implementado:** botón "Invitar estudiante" y modal reutilizando `InviteUserModal` con `defaultAcademyRole="ACADEMY_STUDENT"`. Solo visible para `ACADEMY_ADMIN`.
2. **Configuración → Usuarios**: el botón "Invitar Usuario" está arriba de la tabla; si la vista es solo la tabla (p. ej. pantalla pequeña o pestaña "Usuarios" dentro de otro layout), puede no verse.
3. **Asignación a cohorte**: la invitación no pide cohorte; el enrollment a curso/cohorte se hace después (por ahora manual o por otro flujo).

---

## Flujo deseado (resumen)

```
Admin Academia → [Invitar estudiante] → Email + Nombre + Rol (Estudiante)
       ↓
  POST /api/invitations (email, roleId, inviterId, academyRole: ACADEMY_STUDENT)
       ↓
  Invitation creada + Email enviado con link: /auth/invitation/{token}
       ↓
  Estudiante abre link → GET /api/invitations/accept?token=xxx (validar)
       ↓
  Formulario: nombre, contraseña → POST /api/invitations/accept
       ↓
  Usuario creado en el tenant con platformRole = ACADEMY_STUDENT
       ↓
  Redirección a login del tenant para iniciar sesión
```

---

## Fase 1: Hacer visible la invitación en Academia ✅ (implementada)

**Objetivo:** Que desde **Academia → Usuarios** se pueda invitar estudiantes sin depender de Configuración.

**Implementado:** En `StudentsManagement` se añadió el botón "Invitar estudiante" (visible solo para `ACADEMY_ADMIN`), estado para el modal y reutilización de `InviteUserModal` con `defaultAcademyRole="ACADEMY_STUDENT"`. En `InviteUserModal` se añadió la prop opcional `defaultAcademyRole` para pre-seleccionar el rol al abrir desde Academia.

### 1.1 Cambios en `StudentsManagement`

- **Archivo:** `src/modules/academia/components/teacher/StudentsManagement.tsx`
- Añadir:
  - Botón principal **"Invitar estudiante"** (visible arriba de la tabla).
  - Estado para abrir/cerrar un modal de invitación.
  - Reutilizar **`InviteUserModal`** (módulo config) pasando `isAcademyTenant=true` para que pida solo email + rol Academia (Estudiante por defecto).
- Restricción: solo usuarios con rol que pueda invitar (p. ej. ACADEMY_ADMIN) ven el botón.

### 1.2 Permisos

- La API `POST /api/invitations` ya exige `inviterId` con rol SUPERADMIN o ADMINISTRADOR.
- En Academia, el admin suele tener rol ADMINISTRADOR del tenant + `platformRole` ACADEMY_ADMIN. Verificar que ese usuario tenga `invitationLimit` > 0 (o que en tenant Academia no se aplique límite) para que pueda invitar.

### 1.3 Archivos a tocar (máx. 3–4)

- `src/modules/academia/components/teacher/StudentsManagement.tsx` (botón + estado + modal).
- Opcional: extraer un wrapper de `InviteUserModal` en academia si no se quiere importar desde `config` (por ejemplo `AcademyInviteStudentModal.tsx` que llame a la misma API con `academyRole: "ACADEMY_STUDENT"`).

---

## Fase 2: Correo e invitación (ya implementado, solo verificar)

### 2.1 Contenido del email

- **Archivo:** `lib/email.ts` → `sendInvitationEmail`
- Debe incluir:
  - Link: `{baseUrl}/auth/invitation/{token}` (tenant en la URL o en el body según cómo esté montado el front).
- Verificar que `baseUrl` sea la del tenant (ej. `https://kaledacademy.kaledsoft.tech`) para que el link lleve al dominio correcto.

### 2.2 Creación de invitación

- **Archivo:** `src/app/api/invitations/route.ts`
- Ya hace:
  - Validar email, rol, inviter, límites, tenant.
  - Para tenant `kaledacademy`, exige `academyRole` (ACADEMY_STUDENT, ACADEMY_TEACHER, ACADEMY_ADMIN).
  - Crear invitación con token y `expiresAt` (7 días).
  - Llamar a `sendInvitationEmail`; si falla, borrar la invitación y devolver error.

No hay que cambiar lógica; solo asegurar que desde Academia se envíe `academyRole: "ACADEMY_STUDENT"` al invitar estudiantes.

---

## Fase 3: Validación y creación del usuario en el tenant

### 3.1 Página de aceptación

- **Ruta:** `/auth/invitation/[token]`
- **Archivo:** `src/app/auth/invitation/[token]/page.tsx`
- Flujo actual:
  1. Al cargar, `GET /api/invitations/accept?token=xxx` para mostrar institución, email, rol, inviter.
  2. Formulario: nombre, contraseña.
  3. `POST /api/invitations/accept` con `{ token, name, password }`.
  4. Si éxito, redirección a login del tenant (`getTenantLoginUrl(invitation.tenantSlug)`).

### 3.2 API de aceptación

- **Archivo:** `src/app/api/invitations/accept/route.ts`
- **GET:** Valida token, no expirado, no aceptado; devuelve datos para el formulario (incl. `academyRole` si aplica).
- **POST:**
  - Vuelve a validar token y estado.
  - Crea usuario con `AuthService.createUser` (tenantId, roleId, email, name, password).
  - Si tenant es Kaled Academy y la invitación tiene `academyRole`, asigna `platformRole` (ACADEMY_STUDENT, etc.).
  - Marca invitación como ACCEPTED.

Con esto el usuario queda creado en el tenant correcto con el rol de Academia.

### 3.3 Qué no hace (y se puede dejar para después)

- No crea `AcademyEnrollment` ni asigna cohorte en este flujo. Eso puede ser:
  - Un paso posterior en admin (inscribir al usuario ya creado en un curso/cohorte), o
  - Un segundo paso en la aceptación (elegir cohorte) en una fase futura.

---

## Fase 4: Mejoras opcionales

### 4.1 Asignar cohorte al inscribir

- Hoy: inscripción es `userId` + `courseId` + opcional `cohortId`.
- Mejora: en la UI de “inscribir en curso” (admin), permitir elegir cohorte y así crear enrollment con `cohortId` desde el inicio.

### 4.2 Invitación directa a cohorte

- Extensión: al invitar, poder elegir “curso + cohorte” y guardarlo en la invitación (nuevo campo o tabla). Al aceptar, crear usuario y crear `AcademyEnrollment` con ese curso y cohorte. Requiere cambios en schema y en `POST /api/invitations/accept`.

### 4.3 Reenvío de invitación

- Botón “Reenviar email” en la lista de invitaciones (Configuración o Academia) que vuelva a llamar a `sendInvitationEmail` con el mismo token (y opcionalmente renovar `expiresAt`).

---

## Orden de implementación recomendado

1. **Fase 1** (UI Academia): Añadir en `StudentsManagement` el botón “Invitar estudiante” y el modal (reutilizando `InviteUserModal` o un wrapper), y comprobar permisos/límites.
2. **Verificación Fase 2–3**: Probar de punta a punta: invitar desde Academia → abrir correo → aceptar → usuario creado en tenant con ACADEMY_STUDENT.
3. **Fase 4** (opcional): Según necesidad, cohorte en inscripción o en invitación, y reenvío de invitación.

---

## Resumen de archivos clave

| Archivo | Uso |
|---------|-----|
| `src/modules/academia/components/teacher/StudentsManagement.tsx` | Añadir botón + modal de invitación (Fase 1) |
| `src/modules/config/components/InviteUserModal.tsx` | Reutilizar para Academia (tenant kaledacademy, rol Academia) |
| `src/app/api/invitations/route.ts` | Crear invitación y enviar email (ya listo) |
| `src/app/api/invitations/accept/route.ts` | Validar token y crear usuario en tenant (ya listo) |
| `src/app/auth/invitation/[token]/page.tsx` | Página de aceptación (ya listo) |
| `src/lib/email.ts` | `sendInvitationEmail` (ya listo) |

---

## Checklist de validación

- [x] Admin Academia entra a **Academia → Usuarios** y ve botón **Invitar estudiante**. *(Fase 1 implementada)*
- [x] Al hacer clic se abre un modal para email y rol (Estudiante por defecto).
- [ ] Al enviar, se crea la invitación y se envía el correo con link a `/auth/invitation/{token}`. *(verificar E2E)*
- [ ] El link abre la página de aceptación en el dominio del tenant (ej. kaledacademy.kaledsoft.tech).
- [ ] El estudiante completa nombre y contraseña; al enviar se crea el usuario en el tenant con `platformRole = ACADEMY_STUDENT`.
- [ ] Tras crear la cuenta, se redirige al login del tenant y el estudiante puede entrar y ver Academia (estudiante).
