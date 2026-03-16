# Neon: Una sola rama — Guía de corrección

## ¿Por qué se crean múltiples ramas?

La **integración Neon + Vercel** (Vercel-Managed o Neon-Managed) crea automáticamente:

1. **Rama `main`** (o `production`) — la rama principal
2. **Rama `vercel-dev`** (opcional) — si activaste "Create a branch for your development environment"
3. **Ramas `preview/<git-branch>`** — una por cada **preview deployment** de Vercel (cada PR, cada push a una rama de Git)

Cada vez que haces push a una rama o abres un PR, Vercel despliega un preview y Neon crea una rama de base de datos aislada para ese preview.

**Solución:** Usar **Manual Connection** en lugar de la integración. Así todas las previews usan la misma base (main) y no se crean ramas nuevas.

---

## Estado actual (MCP Neon)

### Proyecto visible: amaxoft-admin-secure

| Campo | Valor |
|-------|-------|
| **Project ID** | `plain-shape-31663852` |
| **Ramas** | **1 sola** (`main` — br-green-cake-ahwwshfx) |
| **Endpoint main** | `ep-jolly-morning-ahqdm7y6` |
| **Host pooler** | `ep-jolly-morning-ahqdm7y6-pooler.c-3.us-east-1.aws.neon.tech` |

### Desajuste con tu `.env`

Tu `.env` usa **`ep-empty-tree-ah4r0eiv`** — un endpoint distinto. Posibles causas:

- **Otro proyecto Neon** vinculado a **app-instituto** en Vercel (creado por la integración)
- **Ramas preview** creadas por la integración en ese otro proyecto
- El MCP solo ve el proyecto `amaxoft-admin-secure`; las ramas que ves pueden estar en el proyecto de la integración

### Cambio aplicado en `.env`

Se actualizó `DATABASE_URL` para usar la rama **main** del proyecto `amaxoft-admin-secure` (`ep-jolly-morning-ahqdm7y6`).

**Si tenías datos en `ep-empty-tree-ah4r0eiv`** (otro proyecto o rama), haz backup antes. Para volver al endpoint anterior, restaura la URL previa en `.env` desde tu historial o Neon Console.

## Cómo tener solo UNA rama

### Opción A: Desconectar la integración y usar conexión manual (recomendado)

Con **Manual Connection** no se crean ramas preview; todas las previews usan la misma base.

1. **En Neon Console** (console.neon.tech):
   - Ve a **Integrations** → **Vercel** → **Manage**
   - Clic en **Disconnect**
   - Esto deja de crear nuevas ramas preview

2. **DATABASE_URL en Vercel** — ya configurado:
   - Production, Preview y Development usan la misma URL de la rama main
   - Si la integración Neon inyecta `DATABASE_URL`, elimínala en Vercel → Settings → Environment Variables (la manual tiene prioridad si está definida)

3. **Si necesitas cambiar la URL:**
   - Neon Console → proyecto → **Connect** → rama **main** → copia el connection string (pooler)
   - O usa MCP Neon: `get_connection_string` con `projectId: plain-shape-31663852`

### Opción B: Mantener integración pero eliminar ramas sobrantes

Si quieres seguir usando la integración pero reducir ramas:

1. **Neon Console** → **Branches**
2. Elimina manualmente las ramas `preview/*` y `vercel-dev` que no necesites
3. **Importante:** No elimines la rama `main` (default)

4. **Para evitar nuevas ramas preview:**
   - Desconecta la integración (Opción A, paso 1)
   - O acepta que cada PR creará una rama (se pueden borrar después)

## Limpieza de ramas existentes

### Desde Neon Console
1. **Branches** → selecciona la rama a eliminar
2. **More** → **Delete**
3. Repite para cada rama que no sea `main`

### Desde MCP Neon (si tienes acceso al proyecto correcto)
El agente puede usar `delete_branch` para ramas no default. La rama `main` no se puede eliminar.

## Verificación

Después de los cambios:

- **Una sola rama:** `main` (o `production`)
- **Mismo `DATABASE_URL`** en Production, Preview y Development en Vercel
- **Sin integración** o integración desconectada = sin ramas preview automáticas

## Referencias

- [Neon-Managed Vercel Integration](https://neon.com/docs/guides/neon-managed-vercel-integration)
- [Manual Connection (sin preview branching)](https://neon.com/docs/guides/vercel-manual)
- [Manage branches](https://neon.com/docs/manage/branches)
