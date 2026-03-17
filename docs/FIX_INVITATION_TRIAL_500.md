# Fix: Error 500 al enviar invitación a versión prueba

## Diagnóstico

**Error:** `PrismaClientKnownRequestError` (500) al usar "Invitar a versión prueba" / "Enviar invitación a prueba"

**Rutas afectadas:**
- POST `/api/admin/tenants/kaledacademy/invitations` (useAdminApi=true, desde admin)
- POST `/api/invitations` (useAdminApi=false, desde kaledacademy)

## Verificaciones realizadas

1. **Tabla Invitation en Neon:** Todas las columnas existen (incluidas `isTrialInvitation`, `trialExpiresAt`, `trialCohortName`, `trialNextCohortDate`).
2. **Insert directo:** Funciona correctamente en la base de datos.
3. **Tenant kaledacademy:** Existe con roles (Administrador, ACADEMY_STUDENT, etc.).
4. **Usuario SUPER_ADMIN:** Existe para inviterId.

## Cambios aplicados

1. **Logging mejorado** en `src/app/api/admin/tenants/[id]/invitations/route.ts`:
   - Log detallado del código y mensaje de Prisma cuando falla.

2. **Manejo de P2022** en `src/lib/errors.ts`:
   - Mensaje más claro cuando hay desajuste schema/DB.

3. **Búsqueda de invitación existente** en la API admin:
   - Ahora filtra por `tenantId` además de `email` y `status`.

4. **Fetch con credentials** en `InviteTrialModal.tsx`:
   - `credentials: "include"` para asegurar envío de cookies de sesión.

## Si el error persiste

1. **Revisar logs de Vercel** tras el deploy:
   - Runtime Logs → filtrar por `/api/admin/tenants` o `invitation`
   - Buscar el log `[invitations POST] Prisma error:` con código y mensaje exactos.

2. **Verificar DATABASE_URL en Vercel:**
   - Debe apuntar al proyecto Neon correcto (`neon-app-tecnico` / `polished-recipe-25817067`).
   - Ver [FIX_DATABASE_URL_VERCEL.md](./FIX_DATABASE_URL_VERCEL.md).

3. **Verificar RESEND_API_KEY:**
   - Si el error ocurre *después* del create (al enviar el email), puede ser por Resend.
   - Asegurar que `RESEND_API_KEY` está configurada en Vercel (Environment Variables).

4. **Probar localmente:**
   ```bash
   npm run dev
   # Ir a admin (o kaledacademy), abrir modal de invitación trial, enviar
   # Revisar consola del servidor para el error exacto
   ```
