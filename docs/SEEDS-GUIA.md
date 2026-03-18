# Guía de Seeds — Protección contra borrado accidental

## Qué ocurrió

El seed principal (`prisma/seed.ts`) **borra TODOS los datos** de la base de datos antes de insertar: tenants (kaledsoft, kaledacademy, etc.), usuarios, pagos, programas, etc. Se ejecuta cuando corres:

- `prisma db seed`
- `prisma migrate reset` (incluye el seed al final)

Si ejecutabas cualquiera de estos sin saberlo, perdías kaledsoft, kaledacademy y todos los usuarios.

---

## Protección implementada

Desde ahora, `prisma/seed.ts` **no se ejecuta** a menos que tengas en tu `.env`:

```
SEED_ALLOW_WIPE=1
```

Si no está definido, el seed se bloquea y muestra un mensaje indicando qué hacer.

---

## Seeds por tipo

### Destructivos (borran datos)

| Comando | Qué hace | Cuándo usarlo |
|---------|----------|---------------|
| `prisma db seed` | Borra todo y crea KaledSoft + EDUTEC | Solo en BD vacía o de desarrollo |
| `prisma migrate reset` | Borra todo, aplica migraciones, ejecuta seed | Solo al resetear migraciones desde cero |

**Requisito:** `SEED_ALLOW_WIPE=1` en `.env`.

### Seguros (no borran datos existentes)

| Comando | Qué hace |
|---------|----------|
| `npm run db:seed-kaledacademy-v3` | Crea/actualiza tenant kaledacademy, curso, módulos, contenido. Usa upsert. |
| `npm run db:seed-kaledacademy-v2` | Seed incremental de KaledAcademy (requiere kaledacademy existente) |
| `npm run db:seed-kaledacademy` | Seed inicial de KaledAcademy |
| `npx tsx prisma/seed-email-templates.ts` | Plantillas de email |
| `npx tsx prisma/seed-email-sequences.ts` | Secuencias de email |
| `npx tsx prisma/seed-academy-stack.ts` | Stack de academia |
| `npx tsx prisma/create-kaledsoft-tenant.ts` | Crea tenant KaledSoft si no existe |
| `npm run db:seed-edutec-incremental` | Crea o completa tenant **edutec** (branding, roles, 9 usuarios `@edutec.edu.co`, 5 programas, `MONTHLY_GOAL`). **No borra datos.** Ideal para producción cuando falta Edutec. Luego: `npm run db:validate-edutec-users`. |

Estos seeds **no tocan** el resto de tenants salvo lo indicado. Solo agregan o actualizan datos del alcance del script.

**Edutec en producción:** no uses `seed.ts` (wipe). Usa `db:seed-edutec-incremental` con `DATABASE_URL` de prod y backup previo. Los usuarios nuevos reciben las contraseñas del seed (`Admin123!`, etc.); los que ya existían en Edutec **no** se les cambia la contraseña al re-ejecutar.

---

## Recomendaciones

1. **No agregues `SEED_ALLOW_WIPE=1` en producción** ni en `.env` compartido.
2. **Usa seeds incrementales** para KaledAcademy: `db:seed-kaledacademy-v3`.
3. **Backup antes de ejecutar cualquier seed** en BD con datos reales:
   ```bash
   # Neon: usar punto de restauración o exportar desde el dashboard
   # Local: pg_dump -U user -d dbname > backup.sql
   ```
4. **Documenta** en tu equipo cuáles seeds son destructivos.

---

## Restaurar datos perdidos

Si ya borraste datos:

- **Neon:** Revisar "Branches" en el dashboard; si tienes un branch anterior, puedes restaurar desde ahí.
- **Backup:** Si tienes un dump reciente, restaurar con `psql` o la herramienta de tu proveedor.
- **Seed manual:** Ejecutar `prisma db seed` con `SEED_ALLOW_WIPE=1` para recrear KaledSoft + EDUTEC, y luego `db:seed-kaledacademy-v3` para KaledAcademy.
