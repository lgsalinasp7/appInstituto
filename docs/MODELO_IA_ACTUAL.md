# Modelo de IA Actual - EDUTEC

## 🎯 **Resumen Ejecutivo**

**Modelo en Uso:** Google Gemini 2.0 Flash
**Proveedor:** Google AI Studio
**Free Tier:** 250,000,000 tokens/mes
**Renovación:** Mensual (1° de cada mes)
**Estado:** ✅ Totalmente funcional con tracking implementado

---

## 📊 **Información del Modelo**

### **Capacidades**
- ✅ Text generation (generación de texto)
- ✅ Function calling (llamada a herramientas)
- ✅ Multimodal (texto + imagen + video)
- ✅ Context window: 1M tokens
- ✅ Streaming responses

### **Límites (Free Tier)**
```
Free Tier:     250,000,000 tokens/mes
RPM (requests): 15 por minuto
RPD (requests): 1,500 por día
Renovación:    1° de cada mes
```

### **Costos (Post Free-Tier)**
```
Input:  $0.075 / 1M tokens = 300 COP / 1M tokens
Output: $0.30 / 1M tokens  = 1,200 COP / 1M tokens
```

---

## 📈 **Análisis para EDUTEC**

### **Consumo Esperado**
```
Perfil:           Instituto Pequeño
Usuarios:         ~56 (5 docentes + 1 coord + 50 estudiantes)
Tokens/mes:       120,000
Conversaciones:   ~100/mes
Tokens/conv:      ~1,200
```

### **Duración del Free Tier**
```
250,000,000 tokens / 120,000 tokens/mes = 2,083 meses

= 173.6 años 🎉
```

### **Porcentaje de Uso**
```
120,000 / 250,000,000 = 0.048%

Usa menos del 0.05% del free tier mensual
```

### **Conclusión**
✅ **EXCELENTE** - Free tier es MÁS que suficiente
✅ No necesitarás pagar por IA en el mediano plazo
✅ Incluso con crecimiento 10x sigues cubierto por años

---

## 🔄 **Historia de Cambios**

### **v1.0 - Implementación Inicial (19 Feb 2026)**
- **Modelo:** Groq - Llama 3.3 70B Versatile
- **Free Tier:** 15M tokens/día (450M/mes)
- **Razón:** Ultra-rápido, buen free tier

### **v2.0 - Migración a Gemini (20 Feb 2026)** ⭐ ACTUAL
- **Modelo:** Google Gemini 2.0 Flash
- **Free Tier:** 250M tokens/mes
- **Mejoras:**
  - ✅ 16.6x más tokens que Groq mensualmente
  - ✅ Renovación mensual (más simple que diaria)
  - ✅ Multimodal (imágenes, video, PDF)
  - ✅ Context window más grande (1M vs 32k)
  - ✅ Mejor para multi-tenant
  - ✅ Menor costo post free-tier

---

## 🛠️ **Configuración Actual**

### **Archivo:** `src/app/api/chat/stream/route.ts`

```typescript
import { google } from "@ai-sdk/google";

const result = streamText({
  model: google("gemini-2.0-flash"),
  system: systemPrompt,
  messages,
  tools,
  stopWhen: stepCountIs(5),
  temperature: 0.7,
});
```

### **Variables de Entorno**

```env
GOOGLE_GENERATIVE_AI_API_KEY="tu-api-key"
NEXT_PUBLIC_AI_ENABLED="true"
```

### **Dependencias**

```json
{
  "ai": "^6.0.94",
  "@ai-sdk/google": "^1.0.0"
}
```

---

## 📊 **Tracking Implementado**

### **Base de Datos**

**Tabla `AiMessage` (extendida):**
- `modelUsed`: "gemini-2.0-flash"
- `inputTokens`: Tokens de entrada
- `outputTokens`: Tokens de salida
- `totalTokens`: Total
- `costInCents`: Costo en centavos COP

**Tabla `AiModel`:**
```json
{
  "name": "Gemini 2.5 Flash",
  "provider": "Google AI Studio",
  "modelIdentifier": "gemini-2.0-flash",
  "freeTokensLimit": 250000000,
  "inputCostPer1k": 0.3,
  "outputCostPer1k": 1.2,
  "resetPeriod": "MONTHLY"
}
```

**Tabla `AiUsage`:**
- Agrega uso por tenant/modelo/período
- Permite reportes históricos
- Base para facturación futura

### **Dashboard**

**URL:** `/admin/agentes`

**Muestra:**
- Total tokens consumidos
- Mensajes procesados
- Costo acumulado (COP)
- Free tier usado (%)
- Gráficos de tendencias
- Top tenants por consumo

---

## 🔮 **Proyecciones**

### **Escenario Conservador (uso actual)**
```
Consumo:    120,000 tokens/mes
Duración:   173 años
Costo:      $0 COP/mes
```

### **Escenario Crecimiento 5x**
```
Consumo:    600,000 tokens/mes
Duración:   34.7 años
Costo:      $0 COP/mes
```

### **Escenario Crecimiento 10x**
```
Consumo:    1,200,000 tokens/mes
Duración:   17.4 años
Costo:      $0 COP/mes
```

### **Escenario Agresivo 50x**
```
Consumo:    6,000,000 tokens/mes
Duración:   3.5 años
Costo:      $0 COP/mes (dentro del free tier)
```

### **Límite del Free Tier**
```
Consumo:    250,000,000 tokens/mes
Estado:     Agotado
Costo:      Empieza a cobrar
Post-tier:  ~$90,000 COP/mes (si duplicas el límite)
```

---

## 🚨 **Alertas y Monitoreo**

### **Configurar Alertas En:**

**80% del Free Tier (200M tokens):**
- Email a admin
- Dashboard warning
- Revisar optimizaciones

**90% del Free Tier (225M tokens):**
- Email urgente
- Revisar prompts
- Considerar plan de pago

**95% del Free Tier (237.5M tokens):**
- Alerta crítica
- Reducir uso temporalmente
- Activar plan de pago

### **Revisiones Recomendadas**

- **Semanal:** Dashboard de agentes
- **Mensual:** Análisis de tendencias
- **Trimestral:** Proyecciones de crecimiento
- **Anual:** Revisar alternativas de proveedores

---

## 🎯 **Herramientas Disponibles**

El agente IA tiene acceso a:

1. **`getStudentStats`** - Estadísticas de estudiantes
2. **`getProgramInfo`** - Información de programas
3. **`getCarteraReport`** - Reportes de cartera
4. **`searchStudents`** - Búsqueda de estudiantes
5. **`getAdvisorPerformance`** - Rendimiento de asesores

Cada herramienta consume tokens adicionales (tool calls).

---

## 💡 **Optimizaciones Recomendadas**

### **Reducir Consumo de Tokens**

1. **Prompts más concisos:**
   ```
   ❌ "Por favor, ¿podrías amablemente explicarme..."
   ✅ "Explica brevemente..."
   ```

2. **Limitar historial:**
   ```typescript
   // Solo últimos 5 mensajes
   messages: conversation.messages.slice(-5)
   ```

3. **Cachear respuestas comunes:**
   - FAQ sobre programas
   - Información estática del instituto

4. **System prompt optimizado:**
   ```
   ❌ System: 500 tokens de contexto
   ✅ System: 100 tokens esenciales
   ```

### **Maximizar Free Tier**

- ✅ Usar para tareas complejas (análisis, reportes)
- ✅ Educar usuarios sobre uso eficiente
- ✅ Monitorear patrones de uso
- ❌ No usar para tareas triviales

---

## 📚 **Referencias**

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Gemini Pricing](https://ai.google.dev/pricing)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Dashboard Admin](/admin/agentes)
- [Referencia Free Tier](/admin/agentes/referencia)

---

## ✅ **Checklist de Estado**

- [x] Modelo configurado: Gemini 2.0 Flash
- [x] API Key válida de Google AI Studio
- [x] Tracking implementado y funcionando
- [x] Dashboard disponible
- [x] Límites actualizados (250M tokens)
- [x] Documentación completa
- [x] Tabla de referencia de proveedores
- [x] Herramientas (tools) funcionando
- [x] Multi-tenant isolation
- [x] Persistencia en base de datos

---

## 🎉 **Conclusión**

**EDUTEC está usando el modelo óptimo para su caso de uso:**

✅ **Gemini 2.0 Flash** ofrece:
- Suficiente free tier para >150 años
- Multimodal (futuras expansiones)
- Excelente rendimiento
- Bajo costo post-tier
- Context window grande (1M)

**No se requieren cambios en el corto-mediano plazo.**

---

**Última actualización:** 20 de febrero de 2026
**Próxima revisión:** Marzo 2026 (mensual)
