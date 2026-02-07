# Guia de Pruebas End-to-End - KaledSoft Platform

## Pre-requisitos

### 1. Ejecutar el Seed (OBLIGATORIO)

```bash
# Resetear la base de datos y cargar datos de prueba
npx prisma db push --force-reset
npx tsx prisma/seed.ts
```

### 2. Configurar hosts locales (para multi-tenant)

Editar el archivo `C:\Windows\System32\drivers\etc\hosts` como Administrador:

```
127.0.0.1  kaledsoft.tech
127.0.0.1  admin.kaledsoft.tech
127.0.0.1  edutec.kaledsoft.tech
```

### 3. Configurar .env

```bash
# Copiar y completar
cp .env.example .env
# Asegurar que NEXT_PUBLIC_ROOT_DOMAIN=kaledsoft.tech
```

### 4. Iniciar el servidor

```bash
npm run dev
```

---

## Credenciales de Prueba

| Contexto | Email | Password | Rol |
|---|---|---|---|
| **Plataforma** | superadmin@kaledsoft.tech | Admin123! | SUPER_ADMIN |
| **Tenant EDUTEC** | superadmin@edutec.edu.co | Admin123! | SUPERADMIN (tenant) |
| **Tenant EDUTEC** | admin@edutec.edu.co | Admin123! | ADMINISTRADOR |
| **Tenant EDUTEC** | asesor1@edutec.edu.co | Asesor123! | VENTAS |
| **Tenant EDUTEC** | recaudos1@edutec.edu.co | Recaudos123! | CARTERA |

---

## FASE A: Pruebas de Landing (kaledsoft.tech)

**URL**: `http://kaledsoft.tech:3000` (o `http://localhost:3000`)

### A1. Verificar Pagina Completa

- [ ] NavBar visible con logo KaledSoft
- [ ] Links de navegacion funcionan (Servicios, Funcionalidades, Precios, Contacto)
- [ ] Seccion Hero con CTAs
- [ ] Seccion Servicios (6 cards)
- [ ] Seccion Features (12 cards)
- [ ] Seccion Testimonios (3 testimonios)
- [ ] Seccion Pricing (3 planes con botones funcionales)
- [ ] Seccion CTA con boton "Solicitar Demo", "WhatsApp", "Hablar con Ventas"
- [ ] Footer con redes sociales, contacto, links

### A2. Verificar Links

- [ ] "Portal Cliente" -> redirige a /auth/login
- [ ] "Cotizar Proyecto" -> scroll a #contact
- [ ] Botones de pricing -> abren mailto
- [ ] Redes sociales -> abren en nueva pestana

---

## FASE B: Pruebas del Panel Admin (admin.kaledsoft.tech)

**URL**: `http://admin.kaledsoft.tech:3000`

### B1. Login de Plataforma

- [ ] Acceder a `http://admin.kaledsoft.tech:3000` -> redirige a /login
- [ ] Login con `superadmin@kaledsoft.tech` / `Admin123!`
- [ ] Redirige a /admin despues del login
- [ ] Panel admin visible con menu lateral

### B2. Verificar Seguridad Admin

- [ ] Intentar login con `admin@edutec.edu.co` -> debe RECHAZAR (es usuario de tenant, no plataforma)
- [ ] Acceder a /admin sin sesion -> redirige a /login
- [ ] Cookie `session_token` es httpOnly (verificar en DevTools > Application > Cookies)

### B3. Funcionalidades Admin

- [ ] Ver lista de tenants/empresas
- [ ] Ver detalle de un tenant
- [ ] Ver pagina de roles
- [ ] Ver pagina de usuarios
- [ ] Ver pagina de auditoria
- [ ] Ver pagina de programas

### B4. Cerrar Sesion Admin

- [ ] Logout funciona correctamente
- [ ] Redirige a /login
- [ ] No se puede acceder a /admin despues del logout

---

## FASE C: Pruebas del Tenant (edutec.kaledsoft.tech)

**URL**: `http://edutec.kaledsoft.tech:3000`

### C1. Login como SuperAdmin del Tenant

- [ ] Acceder a `http://edutec.kaledsoft.tech:3000` -> redirige a /auth/login
- [ ] Login con `superadmin@edutec.edu.co` / `Admin123!`
- [ ] Redirige a /dashboard
- [ ] Dashboard visible con branding EDUTEC (colores, nombre)
- [ ] Sidebar muestra nombre del tenant (no "KaledSoft")
- [ ] No hay NINGUNA referencia a "KaledSoft" en la UI

### C2. Navegacion del Dashboard (SuperAdmin)

- [ ] Dashboard principal con estadisticas
- [ ] Pagina de Estudiantes -> lista con datos
- [ ] Pagina de Pagos -> lista de pagos
- [ ] Pagina de Programas -> 5 programas cargados
- [ ] Pagina de Prospectos -> 6 prospectos
- [ ] Pagina de Usuarios -> lista de usuarios del tenant
- [ ] Pagina de Roles -> roles del tenant
- [ ] Pagina de Reportes (si existe)
- [ ] Pagina de Perfil -> muestra datos del usuario y rol

### C3. Login como Asesor (rol limitado)

- [ ] Logout del SuperAdmin
- [ ] Login con `asesor1@edutec.edu.co` / `Asesor123!`
- [ ] Dashboard visible
- [ ] Solo ve datos asignados a el (filtro por advisorId)
- [ ] No tiene acceso a gestion de usuarios/roles (dependiendo de permisos)

### C4. Login como Cartera (rol limitado)

- [ ] Logout del Asesor
- [ ] Login con `recaudos1@edutec.edu.co` / `Recaudos123!`
- [ ] Dashboard visible
- [ ] Solo ve funcionalidades de cartera/recaudos

### C5. Branding Dinamico

- [ ] Colores del tema corresponden a TenantBranding (azul oscuro #1e3a5f)
- [ ] Footer muestra "Instituto EDUTEC - Educamos con Valores"
- [ ] Login page muestra branding del tenant (no KaledSoft)

---

## FASE D: Pruebas de Seguridad

### D1. API sin Autenticacion

Abrir terminal y ejecutar:

```powershell
# Debe retornar 401 Unauthorized
Invoke-WebRequest -Uri "http://edutec.kaledsoft.tech:3000/api/students" -Method GET

# Debe retornar 401 Unauthorized
Invoke-WebRequest -Uri "http://edutec.kaledsoft.tech:3000/api/payments" -Method GET

# Debe retornar 401 Unauthorized
Invoke-WebRequest -Uri "http://edutec.kaledsoft.tech:3000/api/users" -Method GET

# Debe retornar 401 Unauthorized (rutas admin)
Invoke-WebRequest -Uri "http://admin.kaledsoft.tech:3000/api/admin/tenants" -Method GET
```

### D2. Cross-Tenant (Aislamiento de Datos)

- [ ] Loguearse en `edutec.kaledsoft.tech` como asesor
- [ ] Los datos que se ven solo pertenecen al tenant EDUTEC
- [ ] No se pueden ver/modificar datos de otro tenant

### D3. Rate Limiting

```powershell
# Intentar login 6+ veces con password incorrecto
# Despues del 5to intento debe retornar error de rate limit
for ($i=1; $i -le 7; $i++) {
    $body = '{"email":"superadmin@edutec.edu.co","password":"wrongpassword"}'
    try {
        $response = Invoke-WebRequest -Uri "http://edutec.kaledsoft.tech:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
        Write-Host "Intento $i : $($response.StatusCode)"
    } catch {
        Write-Host "Intento $i : $($_.Exception.Response.StatusCode)"
    }
}
```

### D4. Sesion Server-Side

- [ ] Cookie `session_token` es httpOnly (no accesible via JS)
- [ ] Cookie es secure en produccion
- [ ] Sesion expira despues de 7 dias
- [ ] Logout elimina la sesion de la DB

### D5. Tenant Suspendido

Para probar esto necesitas cambiar el estado del tenant en la DB:

```sql
-- En Prisma Studio (npx prisma studio) o via SQL
-- Cambiar estado del tenant a SUSPENDIDO
UPDATE "Tenant" SET status = 'SUSPENDIDO' WHERE slug = 'edutec';
```

- [ ] Al acceder a `edutec.kaledsoft.tech` -> redirige a pagina de suspension
- [ ] Las APIs retornan error 403

```sql
-- Restaurar
UPDATE "Tenant" SET status = 'ACTIVO' WHERE slug = 'edutec';
```

---

## FASE E: Pruebas de API Endpoints

### E1. Obtener sesion (logueado)

```powershell
# Primero loguearse desde el navegador en edutec.kaledsoft.tech
# Copiar la cookie session_token de DevTools
$session = "TU_SESSION_TOKEN_AQUI"

# GET /api/auth/me - debe retornar datos del usuario
Invoke-WebRequest -Uri "http://edutec.kaledsoft.tech:3000/api/auth/me" -Headers @{Cookie="session_token=$session"}
```

### E2. CRUD de Estudiantes (con sesion)

```powershell
# GET /api/students
Invoke-WebRequest -Uri "http://edutec.kaledsoft.tech:3000/api/students" -Headers @{Cookie="session_token=$session"}

# Los datos retornados deben pertenecer SOLO al tenant edutec
```

### E3. Cron Job (con CRON_SECRET)

```powershell
# Sin secret -> 401
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/notifications" -Method GET

# Con secret -> 200
$cronSecret = "TU_CRON_SECRET"
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/notifications" -Headers @{Authorization="Bearer $cronSecret"}
```

---

## Checklist de Verificacion Final

### Seguridad
- [ ] Todas las API routes retornan 401 sin sesion
- [ ] Rate limiting funciona en login
- [ ] Cookies son httpOnly
- [ ] CSRF validation activa en mutaciones
- [ ] Datos aislados por tenant

### Multi-Tenancy
- [ ] Tenant se detecta correctamente por subdominio
- [ ] Branding dinamico funciona
- [ ] Usuarios no pueden acceder a datos de otro tenant
- [ ] Panel admin solo accesible por usuarios de plataforma

### Funcionalidad
- [ ] Login/logout funciona para todos los roles
- [ ] Dashboard muestra datos correctos
- [ ] CRUD de estudiantes funciona
- [ ] Pagos se registran correctamente
- [ ] Prospectos se listan

### Landing
- [ ] Todas las secciones se renderizan
- [ ] Links funcionales
- [ ] Responsive en movil

---

## Solucion de Problemas Comunes

### "No se pudo determinar el tenant"
- Verificar que el archivo hosts tiene `127.0.0.1 edutec.kaledsoft.tech`
- Verificar que `NEXT_PUBLIC_ROOT_DOMAIN=kaledsoft.tech` esta en `.env`

### "Cuenta sin contrasena configurada"
- Re-ejecutar el seed: `npx tsx prisma/seed.ts`

### Error 500 en API
- Verificar la consola del servidor para ver el error completo
- Verificar que la DB tiene datos (correr seed)

### Landing se ve en lugar del tenant
- Verificar el middleware detecta el subdominio correctamente
- El host debe ser `edutec.kaledsoft.tech:3000`, no `localhost:3000`

### Admin redirige a login infinitamente
- Verificar que el usuario tiene `platformRole: SUPER_ADMIN` y `tenantId: null`
- Re-ejecutar el seed
