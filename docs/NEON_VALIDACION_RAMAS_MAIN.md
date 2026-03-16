# Validación: ramas Neon vs main

**Fecha:** 2026-03-15  
**Proyecto:** amaxoft-admin-secure (plain-shape-31663852)

---

## Resultado: solo existe la rama `main`

El MCP Neon tiene acceso únicamente al proyecto **amaxoft-admin-secure** y en él **solo hay una rama: `main`**.

| Rama | ID | Estado | Creada |
|------|-----|--------|--------|
| **main** | br-green-cake-ahwwshfx | ready | 2025-10-25 |

**No hay otras ramas** (preview, vercel-dev, etc.) en este proyecto. Por tanto, no es posible comparar ramas ni validar si algo “se subió” desde otras ramas a main: main es la única rama.

---

## Contenido actual de `main`

### Esquemas y tablas

| Esquema | Tablas |
|---------|--------|
| **public** | 59 |
| **neon_auth** | 9 |
| **restobar** | 21 |

### Últimas migraciones Prisma aplicadas

| Migración | Fecha |
|-----------|-------|
| 20251204185915_add_profile_billing_fields | 2025-12-04 |
| 20251204180000_add_advisor_quotation_status_enum | 2025-12-04 |
| 20251019132745_add_pdf_fields_to_products | 2025-12-04 |
| 20251019102309_add_landing_page_fields_to_products_and_memberships | 2025-12-04 |
| 20251014182951_init_neon | 2025-12-04 |

### Tablas principales presentes

- **Core:** tenants, users, profiles, tenant_invitations, tenant_user_access
- **Negocio:** orders, products, quotations, contracts, payments, etc.
- **Restobar:** reservas, clientes, platos_evento, etc.
- **Auth:** neon_auth (account, session, user, organization, member, etc.)

### Observación: modelos Academy en Prisma

El `schema.prisma` define modelos de Academia (AcademyCourse, AcademyModule, AcademyLesson, AcademyEnrollment, etc.), pero **no existen tablas Academy en la base de datos** actual. Posibles causas:

- Migraciones de Academia no ejecutadas
- Uso de otra base de datos para Academia
- Datos en otro proyecto Neon (por ejemplo, el que usaba `ep-empty-tree`)

---

## Si tenías ramas en otro proyecto

Las ramas que veías antes (preview, vercel-dev, etc.) podían estar en:

1. **Otro proyecto Neon** vinculado a Vercel (por ejemplo, el de `ep-empty-tree-ah4r0eiv`)
2. **Otra organización** de Neon a la que el MCP no tiene acceso

Para validar que todo lo de esas ramas está en main:

1. Entra en **Neon Console** (console.neon.tech)
2. Abre el proyecto donde estaban las ramas
3. En **Branches**, compara el esquema y datos de cada rama con main
4. Si alguna rama tiene cambios que main no tiene, puedes:
   - Exportar datos (pg_dump) de esa rama
   - Importarlos en main
   - O usar “Promote branch” si Neon lo ofrece para esa rama

---

## Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Hay otras ramas además de main? | No, solo main |
| ¿Se puede comparar main con otras ramas? | No, no hay otras ramas en este proyecto |
| ¿Main está completo? | Sí, tiene 89 tablas en total y las migraciones Prisma aplicadas |
| ¿Faltan tablas Academy? | Sí, no existen en la base actual |
