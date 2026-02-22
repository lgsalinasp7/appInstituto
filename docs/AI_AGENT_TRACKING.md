# Sistema de Tracking de Agentes IA

## Descripción General

El Sistema de Tracking de Agentes IA permite monitorear y controlar el consumo de tokens de modelos de inteligencia artificial (actualmente Google Gemini 2.0 Flash) en toda la plataforma KaledSoft.

## Características Principales

### 📊 Dashboard de Monitoreo

Accede desde el panel de administración en `/admin/agentes` (solo SUPER_ADMIN y MARKETING).

**KPIs Principales:**
- **Total Tokens**: Consumo total de tokens en el período actual con tendencia vs mes anterior
- **Mensajes IA**: Cantidad total de mensajes procesados
- **Costo Total**: Gasto acumulado en pesos colombianos (COP)
- **Modelos Activos**: Cantidad de modelos de IA configurados

### 🎯 Free Tier Management

**Límite Mensual:** 100,000 tokens gratuitos por mes (Gemini 2.0 Flash)

**Indicadores de Estado:**
- 🟢 **Verde (0-70%)**: Uso normal
- 🟡 **Amarillo (70-90%)**: Acercándose al límite
- 🔴 **Rojo (>90%)**: Límite casi alcanzado

**Información mostrada:**
- Tokens usados / Límite total
- Porcentaje de consumo
- Tokens restantes
- Fecha de reinicio (primer día del mes)

### 📈 Análisis y Reportes

#### 1. Tendencias de Consumo
- Gráfico de área mostrando consumo de tokens en los últimos 30 días
- Visualización diaria de input/output tokens
- Desglose de costos por día

#### 2. Distribución por Modelo
- Gráfico de dona mostrando uso por modelo de IA
- Porcentajes de distribución
- Cantidad de tokens por modelo

#### 3. Top 10 Tenants
Ranking de instituciones por consumo:
- Total de tokens consumidos
- Cantidad de mensajes
- Costo generado
- Porcentaje del total

#### 4. Logs de Uso Reciente
Tabla con las últimas 20 interacciones:
- Timestamp (fecha/hora y tiempo relativo)
- Tenant que generó el consumo
- Modelo utilizado
- Tokens de entrada/salida/total
- Costo de la operación

## Precios y Costos

### Gemini 2.0 Flash (Actual)

**Pricing (USD):**
- Input: $0.075 por 1M tokens
- Output: $0.30 por 1M tokens

**Pricing (COP) - TRM: 4,000:**
- Input: 300 COP por 1M tokens = 0.0003 COP por 1k tokens
- Output: 1,200 COP por 1M tokens = 0.0012 COP por 1k tokens

**Free Tier:**
- 100,000 tokens gratuitos por mes
- Se reinicia el 1° de cada mes
- Aplica solo para Gemini 2.0 Flash

## Casos de Uso

### Para Administradores de Plataforma

1. **Monitoreo de Costos**
   - Visualizar consumo en tiempo real
   - Proyectar costos mensuales
   - Identificar picos de uso inusuales

2. **Control de Tenants**
   - Detectar tenants con alto consumo
   - Establecer políticas de uso justo
   - Planificar límites y quotas

3. **Optimización**
   - Identificar patrones de uso
   - Optimizar prompts para reducir tokens
   - Analizar eficiencia por modelo

4. **Planificación Comercial**
   - Datos para crear planes de pago
   - Establecer límites por plan (Básico, Profesional, Empresarial)
   - Calcular márgenes y rentabilidad

## Acceso y Permisos

### Roles Autorizados
- **SUPER_ADMIN**: Acceso completo
- **MARKETING**: Acceso completo (para análisis de uso)
- **ASESOR_COMERCIAL**: Sin acceso

### URL de Acceso
```
https://admin.kaledsoft.tech/admin/agentes
```

## Arquitectura Técnica

### Modelos de Base de Datos

#### AiMessage (Extendido)
```prisma
model AiMessage {
  // ... campos existentes ...

  // Tracking de tokens
  modelUsed      String?
  inputTokens    Int?
  outputTokens   Int?
  totalTokens    Int?
  costInCents    Int?
  cached         Boolean @default(false)
}
```

#### AiModel (Nuevo)
```prisma
model AiModel {
  id                String      @id @default(cuid())
  name              String
  provider          String
  modelIdentifier   String      @unique
  freeTokensLimit   Int         @default(100000)
  inputCostPer1k    Decimal     @db.Decimal(10, 6)
  outputCostPer1k   Decimal     @db.Decimal(10, 6)
  isActive          Boolean     @default(true)
  resetPeriod       ResetPeriod @default(MONTHLY)
}
```

#### AiUsage (Nuevo)
```prisma
model AiUsage {
  id              String   @id @default(cuid())
  tenantId        String?
  modelId         String
  period          DateTime
  totalTokens     Int
  inputTokens     Int
  outputTokens    Int
  totalCostCents  Int
  messagesCount   Int

  @@unique([tenantId, modelId, period])
}
```

### Servicios

#### AiAgentService
- `getAgentStats()`: KPIs del dashboard
- `getTokenTrends()`: Datos para gráficos de tendencias
- `getModelDistribution()`: Distribución por modelo
- `getUsageLogs()`: Logs paginados
- `getTopTenants()`: Ranking de consumidores
- `recordTokenUsage()`: Registra tokens después de cada respuesta IA
- `getFreeTierUsage()`: Estado del free tier

#### AiModelService
- `getActiveModels()`: Modelos activos
- `getModelByIdentifier()`: Buscar modelo
- `calculateCost()`: Calcular costo de tokens
- `createModel()`: Crear nuevo modelo (CRUD)
- `updateModel()`: Actualizar configuración

### API Endpoints

Todos protegidos con `withPlatformAdmin([SUPER_ADMIN, MARKETING])`:

- `GET /api/admin/agents/stats` - Estadísticas generales
- `GET /api/admin/agents/trends?period=daily&days=30` - Tendencias
- `GET /api/admin/agents/models/distribution` - Distribución de modelos
- `GET /api/admin/agents/usage?page=1&limit=20` - Logs de uso
- `GET /api/admin/agents/top-tenants?limit=10` - Top tenants

## Mantenimiento

### Agregar un Nuevo Modelo de IA

```typescript
import { AiModelService } from '@/modules/chat/services/ai-model.service';

await AiModelService.createModel({
  name: "GPT-4 Turbo",
  provider: "OPENAI",
  modelIdentifier: "gpt-4-turbo",
  freeTokensLimit: 50000,
  inputCostPer1k: 0.01,
  outputCostPer1k: 0.03,
  isActive: true,
  resetPeriod: "MONTHLY"
});
```

### Actualizar Precios

```typescript
await AiModelService.updateModel(modelId, {
  inputCostPer1k: 0.0005,
  outputCostPer1k: 0.0015
});
```

### Cambiar Límite de Free Tier

```typescript
await AiModelService.updateModel(modelId, {
  freeTokensLimit: 150000
});
```

## Monitoreo y Alertas

### Alertas Recomendadas

1. **80% de Free Tier consumido**
   - Notificar a administradores
   - Preparar plan de contingencia

2. **Tenant con >10,000 tokens/día**
   - Revisar uso
   - Contactar al tenant

3. **Costo mensual >$X USD**
   - Evaluar ROI
   - Optimizar prompts

### Métricas a Monitorear

- Consumo diario promedio
- Costo por mensaje
- Tokens por conversación
- Distribución por tenant
- Horarios pico de uso

## Preguntas Frecuentes

### ¿Cómo se calcula el costo?

```
Costo = (inputTokens / 1000 * inputCostPer1k) + (outputTokens / 1000 * outputCostPer1k)
```

Ejemplo con Gemini 2.0 Flash:
- Input: 500 tokens
- Output: 1,500 tokens
- Costo = (500/1000 * 0.0003) + (1500/1000 * 0.0012) = 0.00015 + 0.0018 = 0.00195 COP

### ¿Cuándo se reinicia el free tier?

El free tier se reinicia el primer día de cada mes a las 00:00 UTC.

### ¿Qué pasa si se supera el free tier?

Actualmente el sistema solo monitorea. En futuras versiones:
- Bloqueo automático de IA para tenants
- Notificaciones por email
- Migración a plan de pago

### ¿Los datos históricos se conservan?

Sí, todos los datos se mantienen indefinidamente en la tabla `AiUsage` para análisis histórico.

## Roadmap

### Versión Futura

- [ ] Alertas automáticas por email
- [ ] Límites configurables por tenant
- [ ] Exportación de reportes PDF/Excel
- [ ] API pública para tenants (ver su propio consumo)
- [ ] Integración con múltiples modelos (GPT-4, Claude, etc.)
- [ ] Predicción de costos con ML
- [ ] Dashboard por tenant individual

## Soporte

Para dudas o problemas:
- Email: soporte@kaledsoft.tech
- Documentación técnica: `/docs/AI_AGENT_TRACKING.md`
- Issues: GitHub repository

---

**Última actualización:** Febrero 2026
**Versión:** 1.0.0
**Autor:** KaledSoft Development Team
