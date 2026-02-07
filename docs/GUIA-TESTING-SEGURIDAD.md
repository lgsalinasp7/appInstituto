# Guía de Testing - Seguridad (FASE 0)

**Fecha:** 6 de febrero de 2025

## 🎯 Objetivo

Verificar que todas las protecciones de seguridad implementadas en FASE 0 funcionan correctamente:
- Autenticación con sesiones server-side
- Validación de tenant (multi-tenancy)
- Protección CSRF
- Rate limiting
- Autorización por roles

---

## 🔧 Preparación

### 1. Configurar Variables de Entorno

Asegúrate de tener en tu `.env`:

```env
# Base de datos
DATABASE_URL="postgresql://..."

# Secretos de sesión
SESSION_SECRET="tu-secreto-para-sessions-muy-largo-y-seguro"

# Cron Job
CRON_SECRET="tu-secreto-para-cron-muy-seguro"

# WhatsApp (opcional)
WHATSAPP_API_URL="https://graph.facebook.com/v24.0"
WHATSAPP_PHONE_NUMBER_ID="tu-phone-id"
WHATSAPP_ACCESS_TOKEN="tu-token"

# Dominio base
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 2. Iniciar el Servidor

```bash
npm run dev
```

El servidor debería iniciar en `http://localhost:3000`

---

## 🧪 Tests a Realizar

### Test 1: Autenticación Básica

#### 1.1 Login Exitoso (Crear Sesión)

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "email": "admin@edutec.com",
    "password": "Admin123456"
  }'
```

**Resultado Esperado:**
- Status: `200 OK`
- Response: `{ "success": true, "user": {...} }`
- Header `Set-Cookie` con cookie `session` (httpOnly, secure en prod)

**Guardar:** Copia la cookie del header `Set-Cookie` para usarla en los siguientes tests.

#### 1.2 Acceso a Ruta Protegida SIN Sesión (401)

**Endpoint:** `GET /api/students`

**Request:**
```bash
curl -v http://localhost:3000/api/students
```

**Resultado Esperado:**
- Status: `401 Unauthorized`
- Response: `{ "error": "No autorizado. Debe iniciar sesión." }`

#### 1.3 Acceso a Ruta Protegida CON Sesión (200)

**Endpoint:** `GET /api/students`

**Request:**
```bash
curl -v http://localhost:3000/api/students \
  -H "Cookie: session=TU_COOKIE_AQUI"
```

**Resultado Esperado:**
- Status: `200 OK`
- Response: `{ "success": true, "data": {...} }`

---

### Test 2: Validación de Tenant (Multi-Tenancy)

#### 2.1 Acceso con Tenant Correcto

**Configuración:** Usa un usuario que pertenece al tenant "edutec"

**Request:**
```bash
curl -v http://localhost:3000/api/students \
  -H "Cookie: session=TU_COOKIE_AQUI" \
  -H "x-tenant-id: ID_DEL_TENANT_EDUTEC"
```

**Resultado Esperado:**
- Status: `200 OK`
- Solo ve estudiantes de su tenant

#### 2.2 Acceso con Tenant Incorrecto (403)

**Configuración:** Usa sesión de un usuario del tenant "edutec" pero intenta acceder a datos de otro tenant

**Request:**
```bash
curl -v http://localhost:3000/api/students \
  -H "Cookie: session=COOKIE_USUARIO_EDUTEC" \
  -H "x-tenant-id: ID_DE_OTRO_TENANT"
```

**Resultado Esperado:**
- Status: `403 Forbidden`
- Response: `{ "error": "No tiene acceso a este tenant" }`

---

### Test 3: Protección CSRF

#### 3.1 Mutación SIN Header Origin (403)

**Endpoint:** `POST /api/students`

**Request:**
```bash
curl -v -X POST http://localhost:3000/api/students \
  -H "Cookie: session=TU_COOKIE_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Student",
    "email": "test@example.com"
  }'
```

**Resultado Esperado:**
- Status: `403 Forbidden`
- Response: `{ "error": "CSRF validation failed" }`

#### 3.2 Mutación CON Header Origin Correcto (Success)

**Request:**
```bash
curl -v -X POST http://localhost:3000/api/students \
  -H "Cookie: session=TU_COOKIE_AQUI" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "fullName": "Test Student",
    "documentNumber": "1234567890",
    "phone": "3001234567",
    "email": "test@example.com",
    "programId": "ID_DE_UN_PROGRAMA",
    "enrollmentDate": "2025-02-06",
    "paymentFrequency": "MENSUAL"
  }'
```

**Resultado Esperado:**
- Status: `201 Created`
- Response: `{ "success": true, "data": {...}, "message": "Estudiante registrado exitosamente" }`

---

### Test 4: Rate Limiting

#### 4.1 Múltiples Intentos de Login (429)

**Request:** Ejecuta este comando 6 veces seguidas (el límite es 5 intentos en 15 minutos)

```bash
# Intento 1-5: Deberían fallar con 401 (credenciales incorrectas)
# Intento 6+: Debería fallar con 429 (rate limit)

for i in {1..6}; do
  echo "Intento $i:"
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost:3000" \
    -d '{
      "email": "test@example.com",
      "password": "wrong-password"
    }'
  echo ""
  sleep 1
done
```

**Resultado Esperado:**
- Intentos 1-5: `401 Unauthorized` (credenciales incorrectas)
- Intento 6+: `429 Too Many Requests` con mensaje "Demasiados intentos..."

#### 4.2 Rate Limit en Register

**Request:** Ejecuta 4 veces (el límite es 3 intentos por hora)

```bash
for i in {1..4}; do
  echo "Intento $i:"
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -H "Origin: http://localhost:3000" \
    -d "{
      \"email\": \"test$i@example.com\",
      \"password\": \"Password123\",
      \"name\": \"Test User $i\"
    }"
  echo ""
  sleep 1
done
```

**Resultado Esperado:**
- Intentos 1-3: Pueden fallar por otras razones (validación, etc.)
- Intento 4: `429 Too Many Requests`

---

### Test 5: Autorización por Roles (Admin)

#### 5.1 Acceso Admin SIN Rol de Plataforma (403)

**Configuración:** Usuario normal de tenant intenta acceder a ruta admin

**Request:**
```bash
curl -v http://localhost:3000/api/admin/tenants \
  -H "Cookie: session=COOKIE_USUARIO_NORMAL"
```

**Resultado Esperado:**
- Status: `403 Forbidden`
- Response: `{ "error": "No tiene permisos de administrador de plataforma" }`

#### 5.2 Acceso Admin CON Rol SUPER_ADMIN (200)

**Configuración:** Usuario con `platformRole = SUPER_ADMIN`

**Request:**
```bash
curl -v http://localhost:3000/api/admin/tenants \
  -H "Cookie: session=COOKIE_SUPER_ADMIN"
```

**Resultado Esperado:**
- Status: `200 OK`
- Response: Lista de todos los tenants de la plataforma

---

### Test 6: Cron Job (CRON_SECRET)

#### 6.1 Acceso SIN Header Authorization (401)

**Request:**
```bash
curl -v http://localhost:3000/api/cron/notifications
```

**Resultado Esperado:**
- Status: `401 Unauthorized`
- Response: `{ "error": "No autorizado" }`

#### 6.2 Acceso CON CRON_SECRET Incorrecto (401)

**Request:**
```bash
curl -v http://localhost:3000/api/cron/notifications \
  -H "Authorization: Bearer wrong-secret"
```

**Resultado Esperado:**
- Status: `401 Unauthorized`

#### 6.3 Acceso CON CRON_SECRET Correcto (200)

**Request:**
```bash
curl -v http://localhost:3000/api/cron/notifications \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

**Resultado Esperado:**
- Status: `200 OK`
- Response: `{ "success": true, "processed": N, "details": [...] }`

---

### Test 7: Endpoint /api/auth/me

#### 7.1 Sin Sesión (401)

**Request:**
```bash
curl -v http://localhost:3000/api/auth/me
```

**Resultado Esperado:**
- Status: `401 Unauthorized`

#### 7.2 Con Sesión Válida (200)

**Request:**
```bash
curl -v http://localhost:3000/api/auth/me \
  -H "Cookie: session=TU_COOKIE_AQUI"
```

**Resultado Esperado:**
- Status: `200 OK`
- Response: Datos del usuario autenticado con rol y permisos

---

## 🌐 Testing desde el Navegador

### Usando DevTools

1. **Abrir DevTools** (F12)
2. **Ir a la pestaña Network**
3. **Hacer login** en `http://localhost:3000/auth/login`
4. **Verificar:**
   - Cookie `session` creada (Application → Cookies)
   - Cookie tiene flags: `HttpOnly`, `Secure` (en prod), `SameSite=Lax`

5. **Navegar a páginas protegidas:**
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/estudiantes`
   - Verificar que se carga correctamente

6. **Borrar cookie de sesión:**
   - Application → Cookies → Borrar `session`
   - Refrescar página
   - Debería redirigir a `/auth/login`

### Testing de CSRF

1. **Abrir Console en DevTools**
2. **Ejecutar:**

```javascript
// Intento de mutación sin Origin (debería fallar)
fetch('/api/students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Sin Origin header
  },
  body: JSON.stringify({
    fullName: 'Test CSRF',
    email: 'csrf@test.com'
  })
}).then(r => r.json()).then(console.log);
// Esperado: 403 Forbidden

// Mutación desde el mismo origen (debería funcionar)
fetch('/api/students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  },
  body: JSON.stringify({
    fullName: 'Test Success',
    documentNumber: '9999999999',
    phone: '3001234567',
    email: 'success@test.com',
    programId: 'ID_VALIDO',
    enrollmentDate: new Date().toISOString(),
    paymentFrequency: 'MENSUAL'
  })
}).then(r => r.json()).then(console.log);
// Esperado: 201 Created
```

---

## 🔍 Verificación de Seguridad

### Checklist Completo

#### Autenticación
- [ ] Login crea sesión con cookie httpOnly
- [ ] Cookie tiene flags correctos (HttpOnly, Secure en prod, SameSite)
- [ ] Rutas protegidas sin sesión retornan 401
- [ ] Rutas protegidas con sesión válida permiten acceso
- [ ] `/api/auth/me` retorna usuario autenticado
- [ ] Logout invalida sesión correctamente

#### Multi-Tenancy
- [ ] Usuario solo ve datos de su propio tenant
- [ ] Usuario no puede acceder a datos de otro tenant (403)
- [ ] Middleware detecta tenant desde subdominio
- [ ] Header `x-tenant-id` se propaga correctamente

#### CSRF Protection
- [ ] POST/PUT/PATCH/DELETE sin Origin retornan 403
- [ ] Mutaciones con Origin correcto funcionan
- [ ] GET no requiere validación CSRF

#### Rate Limiting
- [ ] Login: 6+ intentos → 429
- [ ] Register: 4+ intentos → 429
- [ ] Forgot password: 4+ intentos → 429
- [ ] Rate limit se resetea después del tiempo especificado

#### Autorización
- [ ] Rutas admin validan platformRole
- [ ] Usuario sin rol admin no accede a `/api/admin/*`
- [ ] Super admin puede gestionar todos los tenants

#### Cron Job
- [ ] Sin Authorization header → 401
- [ ] Con CRON_SECRET incorrecto → 401
- [ ] Con CRON_SECRET correcto → 200

---

## 🚀 Script de Testing Automatizado

Crea un archivo `test-security.sh` (Linux/Mac) o `test-security.ps1` (Windows):

### Bash Script (Linux/Mac)

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
COOKIE=""

echo "========================================="
echo "  TESTING SEGURIDAD - FASE 0"
echo "========================================="
echo ""

# Test 1: Login
echo "Test 1: Login..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: $BASE_URL" \
  -c cookies.txt \
  -d '{
    "email": "admin@edutec.com",
    "password": "Admin123456"
  }')

if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Login exitoso"
  COOKIE=$(cat cookies.txt | grep session | awk '{print $7}')
else
  echo "❌ Login falló"
  echo "$RESPONSE"
  exit 1
fi

echo ""

# Test 2: Ruta protegida sin sesión
echo "Test 2: Acceso sin sesión (debe fallar)..."
RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/students")
if [ "$RESPONSE" = "401" ]; then
  echo "✅ Bloqueado correctamente (401)"
else
  echo "❌ NO bloqueado. Status: $RESPONSE"
fi

echo ""

# Test 3: Ruta protegida con sesión
echo "Test 3: Acceso con sesión (debe funcionar)..."
RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL/api/students" \
  -b cookies.txt)
if [ "$RESPONSE" = "200" ]; then
  echo "✅ Acceso permitido (200)"
else
  echo "❌ Acceso denegado. Status: $RESPONSE"
fi

echo ""

# Test 4: CSRF Protection
echo "Test 4: Mutación sin Origin (debe fallar)..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/students" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com"}' \
  -o /dev/null)
if [ "$RESPONSE" = "403" ]; then
  echo "✅ CSRF bloqueado correctamente (403)"
else
  echo "❌ CSRF NO bloqueado. Status: $RESPONSE"
fi

echo ""

# Test 5: Rate Limiting
echo "Test 5: Rate limiting en login..."
for i in {1..6}; do
  RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -H "Origin: $BASE_URL" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -o /dev/null)
  
  if [ $i -le 5 ]; then
    if [ "$RESPONSE" = "401" ]; then
      echo "  Intento $i: ✅ 401 (esperado)"
    else
      echo "  Intento $i: ⚠️ Status: $RESPONSE"
    fi
  else
    if [ "$RESPONSE" = "429" ]; then
      echo "  Intento $i: ✅ 429 Rate Limited (esperado)"
    else
      echo "  Intento $i: ❌ NO rate limited. Status: $RESPONSE"
    fi
  fi
  sleep 1
done

echo ""
echo "========================================="
echo "  TESTING COMPLETADO"
echo "========================================="

# Cleanup
rm -f cookies.txt
```

### PowerShell Script (Windows)

```powershell
# test-security.ps1

$BaseUrl = "http://localhost:3000"
$CookieJar = "cookies.txt"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  TESTING SEGURIDAD - FASE 0" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login
Write-Host "Test 1: Login..." -ForegroundColor Yellow
$LoginBody = @{
    email = "admin@edutec.com"
    password = "Admin123456"
} | ConvertTo-Json

try {
    $Response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"; "Origin"=$BaseUrl} `
        -Body $LoginBody `
        -SessionVariable Session

    if ($Response.Content -like "*success*") {
        Write-Host "✅ Login exitoso" -ForegroundColor Green
        $SessionCookie = $Session.Cookies.GetCookies($BaseUrl) | Where-Object {$_.Name -eq "session"}
    } else {
        Write-Host "❌ Login falló" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Ruta protegida sin sesión
Write-Host "Test 2: Acceso sin sesión (debe fallar)..." -ForegroundColor Yellow
try {
    $Response = Invoke-WebRequest -Uri "$BaseUrl/api/students" -Method GET
    Write-Host "❌ NO bloqueado. Status: $($Response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Bloqueado correctamente (401)" -ForegroundColor Green
    } else {
        Write-Host "❌ Status inesperado: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Ruta protegida con sesión
Write-Host "Test 3: Acceso con sesión (debe funcionar)..." -ForegroundColor Yellow
try {
    $Response = Invoke-WebRequest -Uri "$BaseUrl/api/students" `
        -Method GET `
        -WebSession $Session
    
    if ($Response.StatusCode -eq 200) {
        Write-Host "✅ Acceso permitido (200)" -ForegroundColor Green
    } else {
        Write-Host "❌ Status inesperado: $($Response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Acceso denegado: $_" -ForegroundColor Red
}

Write-Host ""

# Test 4: CSRF Protection
Write-Host "Test 4: Mutación sin Origin (debe fallar)..." -ForegroundColor Yellow
$StudentBody = @{
    fullName = "Test Student"
    email = "test@test.com"
} | ConvertTo-Json

try {
    $Response = Invoke-WebRequest -Uri "$BaseUrl/api/students" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $StudentBody `
        -WebSession $Session
    
    Write-Host "❌ CSRF NO bloqueado. Status: $($Response.StatusCode)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ CSRF bloqueado correctamente (403)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Status inesperado: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 5: Rate Limiting
Write-Host "Test 5: Rate limiting en login..." -ForegroundColor Yellow
$WrongLoginBody = @{
    email = "test@test.com"
    password = "wrong-password"
} | ConvertTo-Json

for ($i = 1; $i -le 6; $i++) {
    try {
        $Response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"; "Origin"=$BaseUrl} `
            -Body $WrongLoginBody
        
        Write-Host "  Intento ${i}: ⚠️ Status: $($Response.StatusCode)" -ForegroundColor Yellow
    } catch {
        $StatusCode = $_.Exception.Response.StatusCode.value__
        
        if ($i -le 5) {
            if ($StatusCode -eq 401) {
                Write-Host "  Intento ${i}: ✅ 401 (esperado)" -ForegroundColor Green
            } else {
                Write-Host "  Intento ${i}: ⚠️ Status: $StatusCode" -ForegroundColor Yellow
            }
        } else {
            if ($StatusCode -eq 429) {
                Write-Host "  Intento ${i}: ✅ 429 Rate Limited (esperado)" -ForegroundColor Green
            } else {
                Write-Host "  Intento ${i}: ❌ NO rate limited. Status: $StatusCode" -ForegroundColor Red
            }
        }
    }
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  TESTING COMPLETADO" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
```

---

## 🛠️ Testing Manual Interactivo

### Usando Postman o Insomnia

1. **Crear Collection "FASE 0 Security Testing"**

2. **Request 1: Login**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/login`
   - Headers:
     ```
     Content-Type: application/json
     Origin: http://localhost:3000
     ```
   - Body:
     ```json
     {
       "email": "admin@edutec.com",
       "password": "Admin123456"
     }
     ```
   - **Guardar cookie de sesión automáticamente**

3. **Request 2: Get Students (Protegida)**
   - Method: `GET`
   - URL: `http://localhost:3000/api/students`
   - **Postman/Insomnia usará automáticamente la cookie guardada**

4. **Request 3: Create Student (CSRF)**
   - Method: `POST`
   - URL: `http://localhost:3000/api/students`
   - Headers:
     ```
     Content-Type: application/json
     Origin: http://localhost:3000
     ```
   - Body: (datos del estudiante)

5. **Probar sin Origin:**
   - Quitar el header `Origin`
   - Debería retornar `403 Forbidden`

---

## 📱 Testing en la UI

### Flujo Completo de Usuario

1. **Acceder sin sesión:**
   - Ir a `http://localhost:3000/dashboard`
   - Debería redirigir a `/auth/login`

2. **Login:**
   - Completar formulario de login
   - Verificar redirección a dashboard

3. **Navegar por la app:**
   - Dashboard
   - Estudiantes
   - Pagos
   - Reportes
   - Todo debería funcionar correctamente

4. **Probar operaciones CRUD:**
   - Crear un estudiante
   - Editar un estudiante
   - Ver detalles
   - Todo debería funcionar

5. **Logout:**
   - Hacer logout
   - Verificar redirección a login
   - Intentar acceder a `/dashboard` → debería redirigir

6. **Intentar acceder a admin sin permisos:**
   - Login como usuario normal (no admin)
   - Intentar acceder a `http://localhost:3000/admin/empresas`
   - Debería ser bloqueado

---

## 🐛 Debugging

### Ver Logs del Servidor

En la terminal donde corre `npm run dev`, busca:

```
[AUTH] Login attempt for: admin@edutec.com
[AUTH] Session created for user: xxx
[MIDDLEWARE] Tenant detected: edutec
[MIDDLEWARE] Session validated for: admin@edutec.com
```

### Ver Cookies en DevTools

1. **Application → Cookies**
2. **Verificar cookie `session`:**
   - Value: String largo (hash de la sesión)
   - HttpOnly: ✅
   - Secure: ✅ (solo en producción)
   - SameSite: `Lax`
   - Path: `/`

### Verificar Base de Datos

```sql
-- Ver sesiones activas
SELECT id, userId, expiresAt, createdAt 
FROM "Session" 
WHERE expiresAt > NOW()
ORDER BY createdAt DESC;

-- Ver rate limits activos
SELECT * FROM "RateLimit" 
WHERE expiresAt > NOW();
```

---

## 🎯 Casos de Prueba Críticos

### Prioridad 1 (Debe funcionar)
- ✅ Login crea sesión
- ✅ Rutas sin sesión bloqueadas (401)
- ✅ Rutas con sesión permiten acceso
- ✅ Usuario solo ve su tenant
- ✅ CSRF bloquea mutaciones sospechosas

### Prioridad 2 (Importante)
- ✅ Rate limiting funciona
- ✅ Admin routes validan rol de plataforma
- ✅ Cron job valida CRON_SECRET

### Prioridad 3 (Nice to have)
- Mensajes de error claros
- Logs informativos
- Performance aceptable

---

## 📞 Soporte

Si encuentras algún problema:

1. **Verificar logs del servidor** en la terminal
2. **Verificar cookies** en DevTools
3. **Verificar variables de entorno** (.env)
4. **Consultar documentación:**
   - `docs/FASE-0-SEGURIDAD-COMPLETADO.md`
   - `docs/VALIDACION-SKILLS-FASE-0.md`

---

## ✅ Criterios de Aceptación

FASE 0 se considera exitosa si:

1. ✅ Todos los tests de autenticación pasan
2. ✅ Multi-tenancy funciona correctamente
3. ✅ CSRF protection bloquea ataques
4. ✅ Rate limiting se activa correctamente
5. ✅ Admin routes validan roles
6. ✅ No hay regresiones en funcionalidad existente

**Estado Actual:** Listo para testing ✅
