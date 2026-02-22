# Módulo Chat - Agente IA con Groq

## Descripción

Módulo de chat inteligente que implementa un asistente virtual para la plataforma KaledSoft usando Vercel AI SDK y Groq (Llama 3.3 70B).

## Arquitectura

```
src/modules/chat/
├── services/
│   ├── chat.service.ts        # CRUD de conversaciones y mensajes
│   └── ai-tools.service.ts    # Herramientas que el LLM puede invocar
├── schemas/
│   └── index.ts               # Zod schemas para validación
├── types/
│   └── index.ts               # Interfaces TypeScript
└── index.ts                   # Exportador del módulo
```

## ChatService

Gestiona conversaciones y mensajes en base de datos.

### Métodos

#### `getUserConversations(userId, tenantId)`
Retorna lista de conversaciones del usuario ordenadas por fecha.

```typescript
const conversations = await ChatService.getUserConversations(userId, tenantId);
// => ConversationListItem[]
```

#### `getConversationById(id, userId, tenantId)`
Retorna conversación con todos sus mensajes.

```typescript
const conversation = await ChatService.getConversationById(id, userId, tenantId);
// => ConversationWithMessages | null
```

#### `createConversation(userId, tenantId, data)`
Crea nueva conversación.

```typescript
const conversation = await ChatService.createConversation(userId, tenantId, {
  title: "Mi conversación"
});
```

#### `addMessage(data, userId, tenantId)`
Agrega mensaje a conversación existente. Auto-genera título si es primer mensaje.

```typescript
const message = await ChatService.addMessage({
  conversationId: "...",
  role: "user",
  content: "Hola",
}, userId, tenantId);
```

#### `deleteConversation(id, userId, tenantId)`
Elimina conversación (cascade a mensajes).

```typescript
await ChatService.deleteConversation(id, userId, tenantId);
```

---

## AiToolsService

Provee herramientas (functions) que el LLM puede invocar.

### Herramientas Disponibles

#### 1. `getStudentStats(input, tenantId)`

Obtiene estadísticas del sistema.

**Input:**
```typescript
{
  period?: 'today' | 'week' | 'month' | 'year'
}
```

**Output:**
```typescript
{
  resumen: string,
  estudiantes: {
    total: number,
    activos: number,
    nuevosEsteMes: number
  },
  recaudos: {
    hoy: string,        // Formato COP
    esteMes: string,
    mesAnterior: string
  },
  cartera: {
    totalEnMora: string,
    compromisosPendientes: number,
    proximosVencimientos: number
  },
  tendencia: {
    crecimientoMensual: string,
    descripcion: string
  }
}
```

**Ejemplo de uso del LLM:**
- Usuario: "¿Cuál es el recaudo del día?"
- LLM invoca: `getStudentStats({ period: 'today' })`

---

#### 2. `getProgramInfo(input, tenantId)`

Obtiene información de programas académicos.

**Input:**
```typescript
{
  programId?: string,      // Opcional: ID específico
  includeStats?: boolean   // No implementado aún
}
```

**Output (lista):**
```typescript
{
  totalProgramas: number,
  programas: Array<{
    id: string,
    nombre: string,
    valorTotal: string,    // Formato COP
    modulos: number,
    estado: 'Activo' | 'Inactivo'
  }>
}
```

**Output (individual):**
```typescript
{
  programa: {
    nombre: string,
    descripcion: string | null,
    valorTotal: string,
    valorMatricula: string,
    numeroModulos: number,
    estado: 'Activo' | 'Inactivo'
  }
}
```

**Ejemplo:**
- Usuario: "Muéstrame los programas disponibles"
- LLM invoca: `getProgramInfo({})`

---

#### 3. `getCarteraReport(input, tenantId)`

Genera reportes de cartera.

**Input:**
```typescript
{
  type: 'summary' | 'aging' | 'alerts',
  includeDetails?: boolean
}
```

**Output (summary):**
```typescript
{
  tipo: "Resumen de Cartera",
  totalCompromisos: number,
  totalPendiente: string,
  vencidosHoy: { cantidad: number, monto: string },
  vencidosManana: { cantidad: number, monto: string },
  proximosSieteDias: { cantidad: number, monto: string }
}
```

**Output (aging):**
```typescript
{
  tipo: "Reporte de Antigüedad de Cartera",
  totalEnMora: string,
  porRangos: Array<{
    rango: string,
    cantidad: number,
    monto: string
  }>
}
```

**Output (alerts):**
```typescript
{
  tipo: "Alertas de Cartera",
  totalAlertas: number,
  alertas: Array<{
    tipo: "Vencido" | "Vence hoy" | "Próximo",
    estudiante: string,
    fecha: string,      // dd/mm/yyyy
    monto: string,
    mensaje: string
  }>
}
```

**Ejemplo:**
- Usuario: "¿Cuántos compromisos vencen hoy?"
- LLM invoca: `getCarteraReport({ type: 'alerts' })`

---

#### 4. `searchStudents(input, tenantId)`

Busca estudiantes por nombre o documento.

**Input:**
```typescript
{
  query: string,
  limit?: number      // Default: 10
}
```

**Output:**
```typescript
{
  totalEncontrados: number,
  estudiantes: Array<{
    nombre: string,
    documento: string,
    programa: string,
    asesor: string,
    estado: StudentStatus,
    saldoPendiente: string,
    telefono: string,
    email: string
  }>
}
```

**Ejemplo:**
- Usuario: "Busca estudiantes con nombre Juan"
- LLM invoca: `searchStudents({ query: 'Juan', limit: 10 })`

---

#### 5. `getCurrentUserInfo(userId, tenantId)`

Obtiene info del usuario actual (para contexto).

**Output:**
```typescript
{
  usuario: {
    nombre: string,
    email: string,
    rol: string,
    institucion: string
  }
}
```

---

## API Routes

### POST `/api/chat/stream`

Endpoint principal para streaming con IA.

**Body:**
```json
{
  "conversationId": "optional-conversation-id",
  "message": "Pregunta del usuario"
}
```

**Response:**
- Stream de texto usando `toDataStreamResponse()`
- Header `X-Conversation-Id` con ID de conversación (nueva o existente)

**Flujo:**
1. Si no hay `conversationId`, crea nueva conversación
2. Guarda mensaje del usuario en BD
3. Carga historial de mensajes
4. Prepara system prompt con contexto del usuario
5. Configura tools del LLM
6. Invoca `streamText()` con Groq
7. En `onFinish`, guarda respuesta del asistente

**Configuración del modelo:**
```typescript
{
  model: groq('llama-3.3-70b-versatile'),
  system: systemPrompt,
  messages: [...historial, nuevoMensaje],
  tools: { getStudentStats, getProgramInfo, ... },
  maxSteps: 5,
  temperature: 0.7
}
```

---

### GET `/api/chat/conversations`

Lista conversaciones del usuario.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "messageCount": 5,
      "lastMessageAt": "2026-02-19T...",
      "createdAt": "2026-02-19T..."
    }
  ]
}
```

---

### POST `/api/chat/conversations`

Crea nueva conversación.

**Body:**
```json
{
  "title": "Opcional"
}
```

---

### GET `/api/chat/conversations/:id`

Obtiene conversación con mensajes.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "title": "...",
    "messages": [
      {
        "id": "...",
        "role": "user",
        "content": "...",
        "createdAt": "..."
      }
    ]
  }
}
```

---

### DELETE `/api/chat/conversations/:id`

Elimina conversación.

---

## Schemas Zod

### Tool Schemas

```typescript
getStudentStatsToolSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).optional().default('month')
});

getProgramInfoToolSchema = z.object({
  programId: z.string().cuid().optional(),
  includeStats: z.boolean().optional().default(false)
});

getCarteraReportToolSchema = z.object({
  type: z.enum(['summary', 'aging', 'alerts']),
  includeDetails: z.boolean().optional().default(false)
});

searchStudentsToolSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().positive().optional().default(10)
});
```

---

## System Prompt

El system prompt incluye:

1. **Rol del asistente:**
   - "Asistente virtual para sistema KaledSoft"
   - Plataforma de gestión educativa colombiana

2. **Contexto del usuario:**
   - Nombre, email, institución
   - Cargado dinámicamente desde `user` y `tenant`

3. **Capacidades:**
   - Lista de herramientas disponibles

4. **Directrices:**
   - Español de Colombia
   - Formato moneda COP
   - Fechas dd/mm/yyyy
   - Amable, profesional, conciso
   - Pedir detalles si no tiene info suficiente

5. **Información sobre KaledSoft:**
   - Gestión de matrículas, pagos, cartera, reportes

---

## Multi-tenant

Todas las operaciones filtran por `tenantId`:

- ✅ Conversaciones aisladas por tenant
- ✅ Herramientas filtran datos por tenant
- ✅ Services usan `getCurrentTenantId()` o reciben `tenantId` explícito

---

## Formateo de Datos

### Moneda
```typescript
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
```

### Fechas
```typescript
const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
```

---

## Extensibilidad

### Agregar nueva herramienta

1. **Crear tipo de input:**
```typescript
// types/index.ts
export interface MyNewToolInput {
  param1: string;
  param2?: number;
}
```

2. **Crear schema Zod:**
```typescript
// schemas/index.ts
export const myNewToolSchema = z.object({
  param1: z.string().min(1),
  param2: z.number().optional()
});
```

3. **Implementar en AiToolsService:**
```typescript
// services/ai-tools.service.ts
static async myNewTool(input: MyNewToolInput, tenantId: string) {
  // Lógica aquí
  return { result: "..." };
}
```

4. **Registrar en stream route:**
```typescript
// api/chat/stream/route.ts
const tools = {
  // ... tools existentes
  myNewTool: {
    description: "Descripción para el LLM",
    parameters: myNewToolSchema,
    execute: async (params) => {
      return await AiToolsService.myNewTool(params, tenantId);
    }
  }
};
```

---

## Debugging

### Logs útiles

```typescript
// En onFinish callback
console.log("Tool calls:", toolCalls);
console.log("Tool results:", toolResults);
console.log("Final text:", text);
```

### Verificar context window

Groq Llama 3.3 70B tiene 32k tokens de contexto. Si se excede:
- Limitar historial de mensajes (ej. últimos 20)
- Resumir mensajes antiguos
- Usar modelo con mayor contexto

---

## Testing

### Casos de prueba recomendados

1. **Estadísticas simples:**
   - "¿Cuál es el recaudo del día?"
   - "Dame las estadísticas de este mes"

2. **Programas:**
   - "Muéstrame los programas disponibles"
   - "¿Cuánto cuesta el programa de [nombre]?"

3. **Cartera:**
   - "Dame un resumen de cartera"
   - "¿Cuántos compromisos vencen hoy?"

4. **Búsqueda:**
   - "Busca estudiantes con nombre Juan"
   - "Muéstrame info del estudiante con cédula 12345678"

5. **Conversación multi-turn:**
   - Usuario: "¿Cuántos estudiantes tenemos?"
   - IA: "Tenemos X estudiantes..."
   - Usuario: "¿Y cuántos están activos?"
   - IA: "De esos X, Y están activos..."

---

## Performance

- **Streaming:** Respuestas aparecen progresivamente (mejor UX)
- **Tool execution:** Paralela cuando sea posible
- **Indexación BD:** Indexes en `userId`, `tenantId`, `createdAt`
- **Límite conversaciones:** Solo últimas 20 en lista

---

## Seguridad

- ✅ Autenticación requerida (`withTenantAuth`)
- ✅ Validación Zod en inputs
- ✅ Aislamiento multi-tenant
- ✅ No exponer info sensible en prompts
- ✅ Rate limiting de Groq (30 req/min)
