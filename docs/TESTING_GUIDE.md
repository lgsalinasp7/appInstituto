# Guía de Pruebas - Sistema de Tracking de Agentes IA

## 🧪 Plan de Pruebas Paso a Paso

### Preparación

**Estado Actual:** ✅
- Base de datos actualizada con nuevos modelos
- Gemini 2.0 Flash configurado (100k tokens gratis/mes)
- Servicios implementados y funcionando
- UI completa y responsive

### Fase 1: Verificación de Instalación ✅

```bash
# Ejecutar script de pruebas
npx tsx scripts/test-ai-tracking.ts
```

**Resultados Esperados:**
- ✅ Modelo Gemini encontrado
- ✅ Cálculo de costos funcional
- ⚠️ 0 mensajes con tokens (esperado, aún no hemos usado el chat)
- ✅ Estadísticas retornan valores por defecto

### Fase 2: Iniciar Servidor y Acceder al Dashboard

```bash
# Terminal 1: Iniciar servidor de desarrollo
npm run dev
```

**Pasos:**

1. **Abrir navegador:** `http://localhost:3000`

2. **Login como Platform Admin:**
   - Email: `superadmin@kaledsoft.tech`
   - Password: `Admin123!`

3. **Navegar al Dashboard de Agentes:**
   - URL: `http://localhost:3000/admin/agentes`
   - O usar el sidebar: **Inteligencia → Agentes IA**

**Verificaciones:**
- [ ] Página carga sin errores
- [ ] Se muestran 4 KPI cards
- [ ] Free Tier card visible con barra de progreso verde
- [ ] Gráficos muestran estado vacío correctamente
- [ ] Tablas muestran "No hay datos disponibles"

### Fase 3: Generar Datos de Prueba (Chat)

**Objetivo:** Generar conversaciones con IA para crear datos de tracking.

**Pasos:**

1. **Cambiar a un tenant (no admin):**
   - Logout del admin
   - Login como usuario de tenant:
     - Email: `superadmin@edutec.edu.co`
     - Password: `Admin123!`

2. **Acceder al Chat:**
   - URL: `http://edutec.localhost:3000/chat` (o similar según tu setup)
   - Verificar que el chat esté disponible

3. **Enviar mensajes de prueba:**

   ```
   Mensaje 1: "Hola, ¿cómo estás?"
   Mensaje 2: "¿Puedes explicarme qué es la fotosíntesis?"
   Mensaje 3: "Escribe un poema corto sobre la programación"
   Mensaje 4: "Dame 5 tips para estudiar mejor"
   Mensaje 5: "¿Cuál es la capital de Francia y por qué es importante?"
   ```

4. **Esperar respuestas completas**
   - Cada respuesta debe completarse totalmente
   - El sistema captura tokens en el callback `onFinish`

### Fase 4: Verificar Captura de Tokens

**Verificación Manual en Base de Datos:**

```bash
# Terminal 2: Abrir Prisma Studio
npx prisma studio
```

**Tablas a Revisar:**

1. **AiMessage:**
   - Ir a tabla `AiMessage`
   - Buscar mensajes con `role = "assistant"`
   - Verificar que tengan:
     - `modelUsed`: "gemini-2.0-flash"
     - `inputTokens`: > 0
     - `outputTokens`: > 0
     - `totalTokens`: > 0
     - `costInCents`: ≥ 0

2. **AiUsage:**
   - Ir a tabla `AiUsage`
   - Debe haber 1 registro con:
     - `tenantId`: ID del tenant EDUTEC
     - `modelId`: ID del modelo Gemini
     - `period`: Fecha del 1° del mes actual
     - `totalTokens`: suma de todos los mensajes
     - `messagesCount`: cantidad de mensajes

**Verificación con Script:**

```bash
# Re-ejecutar script de pruebas
npx tsx scripts/test-ai-tracking.ts
```

**Resultados Esperados Ahora:**
- ✅ Total de mensajes con tokens: 5 (o más)
- ✅ Último mensaje muestra tokens e input/output
- ✅ Estadísticas muestran tokens > 0
- ✅ Free Tier muestra porcentaje > 0%
- ✅ Top tenants muestra EDUTEC

### Fase 5: Verificar Dashboard Actualizado

**Regresar al Admin Panel:**

1. **Logout del tenant**
2. **Login como admin:** `superadmin@kaledsoft.tech`
3. **Navegar a:** `http://localhost:3000/admin/agentes`

**Verificaciones:**

#### KPI Cards
- [ ] **Total Tokens:** Debe mostrar un número > 0
- [ ] **Mensajes IA:** Debe mostrar 5 (o la cantidad de mensajes enviados)
- [ ] **Costo Total:** Debe mostrar un valor muy pequeño en COP
- [ ] **Modelos Activos:** Debe mostrar 1

#### Free Tier Card
- [ ] Barra de progreso con color verde
- [ ] Porcentaje calculado correctamente
- [ ] Tokens usados / 100,000 correctos
- [ ] Fecha de reinicio correcta (1° del próximo mes)

#### Gráfico de Tendencias
- [ ] Gráfico de área carga correctamente
- [ ] Muestra al menos 1 punto de datos (hoy)
- [ ] Tooltip funciona al hacer hover

#### Gráfico de Distribución
- [ ] Gráfico de dona muestra "Gemini 2.0 Flash"
- [ ] Porcentaje 100% (único modelo)
- [ ] Lista debajo muestra tokens correctos

#### Tabla Top Tenants
- [ ] Muestra "Instituto EDUTEC"
- [ ] Tokens, mensajes y costo correctos
- [ ] % del total = 100% (único tenant)

#### Tabla Uso Reciente
- [ ] Muestra los últimos 20 mensajes (o menos si hay menos)
- [ ] Cada fila tiene: tiempo, tenant, modelo, tokens, costo
- [ ] Timestamps en formato correcto ("Hace Xm/Xh")

### Fase 6: Pruebas de API

**Usando curl o Postman:**

```bash
# 1. Stats
curl -X GET "http://localhost:3000/api/admin/agents/stats" \
  --cookie "session=<tu-session-cookie>"

# 2. Trends
curl -X GET "http://localhost:3000/api/admin/agents/trends?period=daily&days=30" \
  --cookie "session=<tu-session-cookie>"

# 3. Distribution
curl -X GET "http://localhost:3000/api/admin/agents/models/distribution" \
  --cookie "session=<tu-session-cookie>"

# 4. Usage Logs
curl -X GET "http://localhost:3000/api/admin/agents/usage?page=1&limit=20" \
  --cookie "session=<tu-session-cookie>"

# 5. Top Tenants
curl -X GET "http://localhost:3000/api/admin/agents/top-tenants?limit=10" \
  --cookie "session=<tu-session-cookie>"
```

**Verificaciones:**
- [ ] Todos los endpoints retornan 200 OK
- [ ] Response tiene estructura `{ success: true, data: {...} }`
- [ ] Data contiene la información esperada

### Fase 7: Pruebas de Roles y Permisos

**Test 1: Usuario de Tenant (Sin Acceso)**

1. Login como: `admin@edutec.edu.co` / `Admin123!`
2. Intentar acceder: `http://localhost:3000/admin/agentes`
3. **Esperado:** Redirigir o mostrar error 403 (no autorizado)

**Test 2: Asesor Comercial (Sin Acceso)**

1. Login como asesor comercial si tienes uno
2. Intentar acceder a la página de agentes
3. **Esperado:** Sin acceso

**Test 3: Marketing (Con Acceso)**

Si tienes un usuario con rol MARKETING:
1. Login con ese usuario
2. Acceder: `http://localhost:3000/admin/agentes`
3. **Esperado:** Acceso completo al dashboard

### Fase 8: Pruebas de Estrés (Opcional)

**Generar Muchos Mensajes:**

1. Usar el chat para enviar 20-30 mensajes
2. Esperar a que todos se procesen
3. Verificar dashboard:
   - [ ] KPIs se actualizan correctamente
   - [ ] Free tier % aumenta
   - [ ] Gráficos muestran más datos
   - [ ] Tablas paginan correctamente

**Prueba de Múltiples Tenants:**

1. Crear otro tenant o usar uno existente
2. Enviar mensajes desde ese tenant
3. Verificar:
   - [ ] Top Tenants muestra ambos tenants
   - [ ] Porcentajes suman 100%
   - [ ] Cada tenant tiene su propio tracking

### Fase 9: Pruebas de Responsive Design

**Mobile:**
- [ ] Abrir en móvil o DevTools (375px width)
- [ ] KPI cards en columna única
- [ ] Gráficos se adaptan
- [ ] Tablas tienen scroll horizontal
- [ ] Sidebar colapsable funciona

**Tablet:**
- [ ] Probar en 768px
- [ ] Grid 2 columnas para KPIs
- [ ] Layout responsive

**Desktop:**
- [ ] Probar en 1920px
- [ ] Todo el layout visible
- [ ] Máximo aprovechamiento del espacio

### Fase 10: Pruebas de Dark Mode

Si el tenant tiene dark mode:
- [ ] Todos los componentes legibles
- [ ] Contraste adecuado
- [ ] Gráficos visibles
- [ ] Glass cards se ven bien

## ✅ Checklist Final

### Funcionalidad
- [ ] Tokens se capturan automáticamente en cada mensaje
- [ ] Costos se calculan correctamente
- [ ] Free tier se actualiza en tiempo real
- [ ] Agregaciones en AiUsage funcionan
- [ ] Todos los gráficos cargan

### UI/UX
- [ ] Diseño coherente con Kaledsoft
- [ ] Animaciones suaves
- [ ] Loading states apropiados
- [ ] Mensajes de error claros
- [ ] Responsive en todos los tamaños

### Seguridad
- [ ] Solo SUPER_ADMIN y MARKETING acceden
- [ ] APIs protegidas con auth
- [ ] Tenant isolation funciona
- [ ] Sin data leaks entre tenants

### Performance
- [ ] Dashboard carga en < 2s
- [ ] Gráficos renderizan rápido
- [ ] Queries optimizadas con índices
- [ ] Sin memory leaks

## 🐛 Bugs Conocidos / Limitaciones

Ninguna hasta el momento. Reportar cualquier issue encontrado.

## 📊 Resultados Esperados

Después de completar todas las fases:

```
Total Tokens: ~5,000 - 20,000 (depende de los mensajes)
Total Mensajes: 5-30
Costo Total: ~$0.01 - $0.05 COP
Free Tier: 0.005% - 0.02% usado
Top Tenant: Instituto EDUTEC (100%)
```

## 🎯 Próximos Pasos

Una vez verificado todo:

1. ✅ Deploy a staging
2. ✅ Pruebas con datos reales
3. ✅ Configurar alertas
4. ✅ Deploy a producción
5. ✅ Monitorear consumo real

---

**Cualquier pregunta o problema, revisar:**
- Logs del servidor: `npm run dev`
- Prisma Studio: `npx prisma studio`
- Script de pruebas: `npx tsx scripts/test-ai-tracking.ts`
