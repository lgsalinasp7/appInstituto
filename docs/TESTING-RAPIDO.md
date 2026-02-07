# Testing Rápido - Seguridad

## 🚀 Inicio Rápido

### Opción 1: Script Automatizado (Recomendado)

```powershell
# Ejecutar desde la raíz del proyecto
.\test-security.ps1
```

Este script prueba automáticamente:
- Login y creación de sesión
- Acceso sin sesión (401)
- Acceso con sesión (200)
- Endpoint /api/auth/me
- Protección CSRF
- Rate limiting

---

### Opción 2: Testing Manual en Navegador

#### Paso 1: Iniciar el servidor
```bash
npm run dev
```

#### Paso 2: Probar flujo de usuario

1. **Ir a:** `http://localhost:3000/dashboard`
   - Debería redirigir a `/auth/login`

2. **Login:**
   - Email: `admin@edutec.com`
   - Password: `Admin123456`
   - Debería crear sesión y redirigir

3. **Verificar Cookie:**
   - Abre DevTools (F12)
   - Application → Cookies
   - Busca cookie `session` con flag `HttpOnly`

4. **Navegar por la app:**
   - Dashboard ✅
   - Estudiantes ✅
   - Pagos ✅
   - Prospectos ✅

5. **Abrir Console de DevTools y ejecutar:**

```javascript
// Test 1: Obtener usuario actual
fetch('/api/auth/me')
  .then(r => r.json())
  .then(data => console.log('Usuario actual:', data));
// Esperado: { user: {...} }

// Test 2: Acceder a ruta protegida
fetch('/api/students')
  .then(r => r.json())
  .then(data => console.log('Estudiantes:', data));
// Esperado: { success: true, data: {...} }

// Test 3: CSRF Protection - Mutación SIN Origin
fetch('/api/students', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName: 'Test', email: 'test@test.com' })
})
  .then(r => r.json())
  .then(data => console.log('CSRF sin Origin:', data));
// Esperado: { error: "CSRF validation failed" }

// Test 4: Mutación CON Origin correcto
fetch('/api/students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': window.location.origin
  },
  body: JSON.stringify({
    fullName: 'Test Student',
    documentNumber: '9999999999',
    phone: '3001234567',
    email: 'test@example.com',
    programId: 'ID_DE_UN_PROGRAMA_EXISTENTE',
    enrollmentDate: new Date().toISOString(),
    paymentFrequency: 'MENSUAL'
  })
})
  .then(r => r.json())
  .then(data => console.log('Crear estudiante:', data));
// Esperado: { success: true, data: {...} }
```

---

### Opción 3: Testing con cURL

#### 1. Login
```bash
curl -v -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -c cookies.txt \
  -d '{
    "email": "admin@edutec.com",
    "password": "Admin123456"
  }'
```

Guarda el cookie en `cookies.txt`

#### 2. Acceso sin sesión (debe fallar)
```bash
curl -v http://localhost:3000/api/students
```
Esperado: `401 Unauthorized`

#### 3. Acceso con sesión (debe funcionar)
```bash
curl -v http://localhost:3000/api/students \
  -b cookies.txt
```
Esperado: `200 OK`

#### 4. CSRF - Mutación sin Origin (debe fallar)
```bash
curl -v -X POST http://localhost:3000/api/students \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@test.com"}'
```
Esperado: `403 Forbidden`

---

## 🎯 Verificación Rápida (5 minutos)

### Checklist Mínimo

- [ ] Servidor corriendo en `http://localhost:3000`
- [ ] Login funciona y crea sesión
- [ ] Cookie `session` presente con flag `HttpOnly`
- [ ] Dashboard accesible después del login
- [ ] Redirección a login si no hay sesión
- [ ] Mutations funcionan desde la UI
- [ ] Formularios de la app funcionan correctamente

Si todos estos puntos funcionan, **FASE 0 está operativa** ✅

---

## 🐛 Problemas Comunes

### "401 Unauthorized" en todas las rutas
- **Causa:** Sesión no se está creando
- **Solución:** Verificar `SESSION_SECRET` en `.env`

### "CSRF validation failed" en todas las mutaciones
- **Causa:** Headers no se están enviando correctamente
- **Solución:** Verificar que la UI envía el header `Origin`

### "Rate limit exceeded" inmediatamente
- **Causa:** Rate limits no se están limpiando
- **Solución:** Reiniciar el servidor o esperar 15 minutos

### "No se pudo determinar el tenant"
- **Causa:** Middleware no está detectando el tenant
- **Solución:** Verificar que accedes con subdominio o header `x-tenant-id`

---

## 📞 Siguiente Paso

Después de verificar que la seguridad funciona:

```bash
# Si todo está OK, continuar con FASE 2
# Sistema de Branding Dinámico
```

---

## 🎓 Documentación Completa

Para tests más detallados, consulta:
- `docs/GUIA-TESTING-SEGURIDAD.md` - Guía completa paso a paso
- `docs/FASE-0-SEGURIDAD-COMPLETADO.md` - Resumen de implementación
- `docs/VALIDACION-SKILLS-FASE-0.md` - Validación contra skills
