# Guía de Desarrollo - Sistema de Tracking de Agentes IA

## Arquitectura del Sistema

### Flujo de Datos

```
┌─────────────────┐
│  User sends     │
│  chat message   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ /api/chat/stream            │
│ - Procesa con Gemini 2.0    │
│ - streamText() retorna      │
│   usage object              │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ onFinish callback           │
│ - Guarda AiMessage          │
│ - Extrae usage.inputTokens  │
│ - Extrae usage.outputTokens │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ AiAgentService              │
│ .recordTokenUsage()         │
│ - Calcula costo             │
│ - Actualiza AiMessage       │
│ - Agrega a AiUsage          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Database                    │
│ - AiMessage (row-level)     │
│ - AiUsage (aggregated)      │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Admin Dashboard             │
│ /admin/agentes              │
│ - Fetch stats               │
│ - Render charts             │
│ - Show usage logs           │
└─────────────────────────────┘
```

## Integración con Nuevos Modelos

### 1. Agregar el Modelo a la BD

```typescript
// En un script de migración o seed
import { PrismaClient } from '@prisma/client';
import { AiModelService } from '@/modules/chat/services/ai-model.service';

const prisma = new PrismaClient();

async function addNewModel() {
  await AiModelService.createModel({
    name: "GPT-4 Turbo",
    provider: "OPENAI",
    modelIdentifier: "gpt-4-turbo-preview",
    freeTokensLimit: 0, // No free tier
    inputCostPer1k: 0.01 * 4000, // $0.01 USD * 4000 COP/USD
    outputCostPer1k: 0.03 * 4000,
    isActive: true,
    resetPeriod: "MONTHLY"
  });
}
```

### 2. Actualizar el Chat Stream Endpoint

```typescript
// src/app/api/chat/stream/route.ts

import { openai } from '@ai-sdk/openai'; // Importar SDK del modelo

// Cambiar el modelo en streamText
const result = streamText({
  model: openai('gpt-4-turbo-preview'), // <-- Nuevo modelo
  system: systemPrompt,
  messages,
  tools,
  onFinish: async ({ text, toolCalls, toolResults, usage }) => {
    const assistantMessage = await ChatService.addMessage(...);

    if (usage && assistantMessage.id) {
      const { AiAgentService } = await import("@/modules/chat/services/ai-agent.service");
      await AiAgentService.recordTokenUsage(assistantMessage.id, {
        modelUsed: "gpt-4-turbo-preview", // <-- Actualizar identificador
        inputTokens: usage.inputTokens || 0,
        outputTokens: usage.outputTokens || 0,
        cached: false,
      });
    }
  },
});
```

### 3. Soporte para Múltiples Modelos (Dinámico)

```typescript
// Configuración dinámica basada en tenant o contexto
const modelConfig = {
  'gemini-2.0-flash': google('gemini-2.0-flash'),
  'gpt-4-turbo': openai('gpt-4-turbo-preview'),
  'claude-3-opus': anthropic('claude-3-opus-20240229'),
};

// En el endpoint
const selectedModel = getModelForTenant(tenantId); // Función custom
const aiModel = modelConfig[selectedModel];

const result = streamText({
  model: aiModel,
  // ...resto de config
  onFinish: async ({ usage }) => {
    await AiAgentService.recordTokenUsage(messageId, {
      modelUsed: selectedModel,
      inputTokens: usage.inputTokens || 0,
      outputTokens: usage.outputTokens || 0,
    });
  },
});
```

## Servicios

### AiAgentService - Métodos Principales

#### getAgentStats()

```typescript
interface AgentStats {
  totalTokens: number;          // Total de tokens consumidos
  totalMessages: number;        // Total de mensajes procesados
  totalCostCOP: number;         // Costo total en COP
  activeModels: number;         // Modelos activos
  freeTierUsage: FreeTierUsage; // Estado del free tier
  currentPeriod: {
    start: Date;
    end: Date;
  };
  trends: {
    tokensTrend: number;        // % cambio vs período anterior
    messagesTrend: number;
    costTrend: number;
  };
}

// Uso
const stats = await AiAgentService.getAgentStats();
// O para un tenant específico:
const stats = await AiAgentService.getAgentStats(tenantId);
```

#### getTokenTrends()

```typescript
// Obtener tendencias diarias de los últimos 30 días
const trends = await AiAgentService.getTokenTrends('daily', 30);

// Resultado:
[
  {
    date: "2026-02-01",
    tokens: 15000,
    inputTokens: 6000,
    outputTokens: 9000,
    messages: 45,
    cost: 12.5
  },
  // ...
]
```

#### recordTokenUsage()

```typescript
// Llamado automáticamente desde onFinish
await AiAgentService.recordTokenUsage(messageId, {
  modelUsed: "gemini-2.0-flash",
  inputTokens: 500,
  outputTokens: 1500,
  cached: false
});

// Internamente hace:
// 1. Calcula costo con AiModelService.calculateCost()
// 2. Actualiza AiMessage con tokens + costo
// 3. Agrega/actualiza registro en AiUsage (upsert)
```

### AiModelService - Cálculo de Costos

```typescript
const cost = await AiModelService.calculateCost(
  'gemini-2.0-flash',
  500,   // inputTokens
  1500   // outputTokens
);

// Retorna:
{
  inputCost: 0.00015,    // COP
  outputCost: 0.0018,    // COP
  totalCost: 0.00195,    // COP
  costInCents: 0         // 0 centavos (menos de 1 centavo)
}
```

## Componentes UI

### Estructura de Archivos

```
src/app/admin/agentes/
├── page.tsx                      # Server Component (principal)
├── AgentKPICards.tsx             # Client Component
├── FreeTierUsageCard.tsx         # Client Component
├── TokenTrendsChart.tsx          # Client Component (con Recharts)
├── ModelDistributionChart.tsx    # Client Component (con Recharts)
├── TopTenantsTable.tsx           # Client Component
└── RecentUsageTable.tsx          # Client Component
```

### Patrón de Componentes

#### Server Component (page.tsx)

```typescript
// Fetch inicial en server-side
export default async function AgentesPage() {
  const stats = await AiAgentService.getAgentStats();

  return (
    <div className="space-y-8">
      <AgentKPICards stats={stats} />
      <FreeTierUsageCard usage={stats.freeTierUsage} />
      {/* Client components fetching their own data */}
      <TokenTrendsChart />
      <ModelDistributionChart />
    </div>
  );
}
```

#### Client Component con Fetch

```typescript
'use client';

export function TokenTrendsChart() {
  const [data, setData] = useState<TokenTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/admin/agents/trends?period=daily&days=30');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="glass-card rounded-[2rem] p-8">
      {loading ? <LoadingState /> : <Chart data={data} />}
    </div>
  );
}
```

### Recharts con Dynamic Import

```typescript
const AreaChart = dynamic(
  () => import('recharts').then((m) => {
    const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } = m;

    function Chart({ data }) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            {/* Chart config */}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return Chart;
  }),
  {
    ssr: false,
    loading: () => <div>Cargando gráfico...</div>
  }
);
```

## Testing

### Unit Tests - Servicios

```typescript
// tests/modules/chat/ai-agent.service.test.ts

import { AiAgentService } from '@/modules/chat/services/ai-agent.service';
import { PrismaClient } from '@prisma/client';

describe('AiAgentService', () => {
  it('should record token usage correctly', async () => {
    const messageId = 'test-message-id';

    await AiAgentService.recordTokenUsage(messageId, {
      modelUsed: 'gemini-2.0-flash',
      inputTokens: 100,
      outputTokens: 300,
      cached: false
    });

    const message = await prisma.aiMessage.findUnique({
      where: { id: messageId }
    });

    expect(message?.inputTokens).toBe(100);
    expect(message?.outputTokens).toBe(300);
    expect(message?.totalTokens).toBe(400);
    expect(message?.costInCents).toBeGreaterThan(0);
  });

  it('should calculate free tier usage correctly', async () => {
    const usage = await AiAgentService.getFreeTierUsage('tenant-id');

    expect(usage.limit).toBe(100000);
    expect(usage.percentage).toBeLessThanOrEqual(100);
    expect(usage.status).toMatch(/safe|warning|danger/);
  });
});
```

### Integration Tests - API

```typescript
// tests/app/api/admin/agents/stats/route.test.ts

describe('GET /api/admin/agents/stats', () => {
  it('should return agent stats for platform admin', async () => {
    const response = await fetch('/api/admin/agents/stats', {
      headers: {
        Cookie: 'session=platform-admin-session'
      }
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('totalTokens');
    expect(data.data).toHaveProperty('totalMessages');
    expect(data.data).toHaveProperty('totalCostCOP');
  });

  it('should deny access to non-platform users', async () => {
    const response = await fetch('/api/admin/agents/stats', {
      headers: {
        Cookie: 'session=tenant-user-session'
      }
    });

    expect(response.status).toBe(403);
  });
});
```

### E2E Tests - Dashboard

```typescript
// tests/e2e/admin/agentes.spec.ts

import { test, expect } from '@playwright/test';

test('should display agent stats dashboard', async ({ page }) => {
  // Login as platform admin
  await page.goto('/login');
  await page.fill('[name="email"]', 'superadmin@kaledsoft.tech');
  await page.fill('[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');

  // Navigate to agents dashboard
  await page.goto('/admin/agentes');

  // Check KPI cards
  await expect(page.locator('text=Total Tokens')).toBeVisible();
  await expect(page.locator('text=Mensajes IA')).toBeVisible();
  await expect(page.locator('text=Costo Total')).toBeVisible();

  // Check free tier card
  await expect(page.locator('text=Free Tier')).toBeVisible();

  // Check charts loaded
  await expect(page.locator('.recharts-wrapper')).toHaveCount(2);

  // Check tables
  await expect(page.locator('text=Top 10 Tenants')).toBeVisible();
  await expect(page.locator('text=Uso Reciente')).toBeVisible();
});
```

## Optimizaciones

### Indexación en Base de Datos

Los índices ya están configurados en el schema:

```prisma
model AiMessage {
  // ...
  @@index([modelUsed])
  @@index([createdAt])
}

model AiUsage {
  // ...
  @@index([tenantId])
  @@index([modelId])
  @@index([period])
}
```

### Caching de Datos

```typescript
// Implementar cache para stats que no cambian frecuentemente
import { unstable_cache } from 'next/cache';

export const getCachedAgentStats = unstable_cache(
  async () => await AiAgentService.getAgentStats(),
  ['agent-stats'],
  { revalidate: 300 } // 5 minutos
);
```

### Query Optimization

```typescript
// Usar select para reducir datos transferidos
const messages = await prisma.aiMessage.findMany({
  where: { /* ... */ },
  select: {
    id: true,
    totalTokens: true,
    costInCents: true,
    // Solo campos necesarios
  }
});
```

## Seguridad

### Autorización en Rutas

```typescript
// Todas las rutas usan withPlatformAdmin
export const GET = withPlatformAdmin(
  [PlatformRole.SUPER_ADMIN, PlatformRole.MARKETING],
  async (request: NextRequest) => {
    // Solo SUPER_ADMIN y MARKETING pueden acceder
  }
);
```

### Validación de Inputs

```typescript
import { z } from 'zod';

const usageLogsParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  tenantId: z.string().optional(),
  modelId: z.string().optional(),
});

// En el endpoint
const params = usageLogsParamsSchema.parse({
  page: parseInt(searchParams.get('page') || '1'),
  limit: parseInt(searchParams.get('limit') || '20'),
  // ...
});
```

## Troubleshooting

### Los tokens no se están registrando

**Causa:** El callback `onFinish` no se está ejecutando.

**Solución:**
```typescript
// Verificar que usage está disponible
onFinish: async ({ usage }) => {
  console.log('Usage object:', usage); // Debug
  if (!usage) {
    console.error('No usage data from AI SDK');
    return;
  }
  // ...
}
```

### Dashboard muestra ceros

**Causa:** No hay datos en el período actual.

**Solución:**
1. Enviar mensajes en el chat para generar datos
2. Verificar que la tabla `AiUsage` tiene registros:
```sql
SELECT * FROM "AiUsage" ORDER BY "createdAt" DESC LIMIT 10;
```

### Costos no calculan correctamente

**Causa:** Precios mal configurados en `AiModel`.

**Solución:**
```typescript
// Verificar configuración del modelo
const model = await AiModelService.getModelByIdentifier('gemini-2.0-flash');
console.log('Input cost per 1k:', model.inputCostPer1k);
console.log('Output cost per 1k:', model.outputCostPer1k);

// Actualizar si es necesario
await AiModelService.updateModel(model.id, {
  inputCostPer1k: 0.0003,
  outputCostPer1k: 0.0012
});
```

## Recursos Adicionales

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Recharts Documentation](https://recharts.org/)

---

**Última actualización:** Febrero 2026
