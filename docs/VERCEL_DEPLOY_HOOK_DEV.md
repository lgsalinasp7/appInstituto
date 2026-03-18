# Deploy hook dev: error HTTP 404

Un **404** al hacer `POST` al deploy hook significa que **esa URL ya no es válida** en Vercel (hook borrado, proyecto recreado o URL mal copiada).

## Arreglarlo (2 minutos)

1. Entra en [Vercel](https://vercel.com) y abre el proyecto donde quieres desplegar **develop** (p. ej. **app-instituto-dev**).
2. **Settings** → **Git** → **Deploy Hooks**.
3. **Create Hook**:
   - Nombre: `github-develop` (o el que quieras).
   - Branch: **`develop`** (debe coincidir con la rama del workflow).
4. Copia la URL completa (empieza por `https://api.vercel.com/v1/integrations/deploy/...`).
5. En GitHub del repo: **Settings** → **Secrets and variables** → **Actions**.
6. Crea o edita **`VERCEL_DEPLOY_HOOK_DEV`** y pega **solo** esa URL (sin espacios ni comillas).

## Comprobar

- El hook debe ser del **mismo proyecto** Vercel que recibe los deploys de develop.
- Si usas **GitHub integration** además del hook, ambos pueden convivir; el hook fuerza un deploy tras migraciones en CI.

## Otros códigos

| HTTP | Significado habitual |
|------|----------------------|
| 401 | URL truncada o token en la URL inválido (regenerar hook). |
| 403 | Hook de otro equipo/proyecto sin permiso. |
