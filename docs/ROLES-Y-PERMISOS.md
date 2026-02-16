# Roles y Permisos del Tenant

## Resumen de roles (prisma/seed.ts)

| Rol | Permisos en DB | Acceso en Sidebar |
|-----|----------------|-------------------|
| **SUPERADMIN** | `["all"]` | Todo: Panel de Control, Matrículas, Recaudos, Reportes, Configuración |
| **ADMINISTRADOR** | `["all"]` | Todo: Panel de Control, Matrículas, Recaudos, Reportes, Configuración |
| **VENTAS** | `["dashboard", "matriculas"]` | Panel de Control + Matrículas |
| **CARTERA** | `["dashboard", "recaudos"]` | Panel de Control + Gestión de Recaudos |
| **Usuario sin rol / USER** | - | Solo Panel de Control |

## Lógica de acceso (DashboardSidebar / MobileSidebar)

- **Acceso completo** si:
  - `role.name` = "SUPERADMIN" o "ADMINISTRADOR"
  - O `role.permissions` incluye "all"
  - O `platformRole` = "SUPER_ADMIN" (admin de plataforma)

- **VENTAS**: Dashboard + Matrículas
- **CARTERA**: Dashboard + Recaudos
- **Resto**: Solo Dashboard

## Usuarios de ejemplo (seed EDUTEC)

| Email | Rol | Contraseña |
|-------|-----|------------|
| superadmin@edutec.edu.co | SUPERADMIN | Admin123! |
| admin@edutec.edu.co | ADMINISTRADOR | Admin123! |
| asesor1@edutec.edu.co | VENTAS | Asesor123! |
| recaudos1@edutec.edu.co | CARTERA | Recaudos123! |

## Verificación en base de datos

Si un superadmin solo ve Panel de Control, revisar:

1. **Rol del usuario**: `SELECT u.email, r.name FROM "User" u LEFT JOIN "Role" r ON u."roleId" = r.id WHERE u.email = 'superadmin@edutec.edu.co'`
2. **Permisos del rol**: `SELECT name, permissions FROM "Role" WHERE "tenantId" = '<tenant_id>'`
