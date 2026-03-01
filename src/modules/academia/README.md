# Modulo Kaled Academy

Este modulo implementa el LMS completo (cursos, módulos, lecciones, cohortes, progreso) para el tenant `kaledacademy`, integrado desde KledAcademySoft.

## Archivos clave

- `config/academy-tenant.config.ts`: identidad del tenant, admin y branding.
- `config/academy-routes.config.ts`: rutas y permisos por platformRole.
- `services/academy-bootstrap.service.ts`: crea/sincroniza tenant, roles y admin.
- `services/academy-course.service.ts`: CRUD de cursos, módulos y lecciones.
- `services/academy-enrollment.service.ts`: inscripciones a cursos.
- `services/academy-progress.service.ts`: progreso de lecciones.
- `services/academy-cohort.service.ts`: gestión de cohortes.

## Roles (platformRole)

- `ACADEMY_STUDENT`: acceso a /academia/student (cursos, progreso).
- `ACADEMY_TEACHER`: acceso a /academia/teacher (estudiantes, cursos).
- `ACADEMY_ADMIN`: acceso a /academia/admin (cursos, cohortes, usuarios).

## Flujo

1. Crear tenant desde admin (Empresas o ProductTemplate).
2. Invitar usuarios desde Configuración seleccionando rol de Academia.
3. Login en `kaledacademy.kaledsoft.tech/auth/login` → redirige a /academia.
4. Dashboard según rol (student, teacher, admin).

## Reglas de negocio

- Registro público deshabilitado para `kaledacademy`.
- Usuarios gestionados por invitación desde KaledSoft (centro de control).
- platformRole determina acceso dentro de Academia.
