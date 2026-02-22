# Referencia de Free Tiers - Proveedores de IA

## 📋 Resumen de Implementación

Se ha implementado un sistema completo de referencia de free tiers para diferentes proveedores de IA, con:

### ✅ Componentes Creados

1. **Página de Referencia:** `/admin/agentes/referencia`
   - Tabla comparativa de 7 proveedores
   - Calculadora de duración por perfil de uso
   - Interfaz visual con colores y badges

2. **Datos Estructurados:** `src/data/ai-models-free-tier.json`
   - 7 proveedores de IA
   - 7 perfiles de uso
   - Información completa de límites y costos

3. **Componentes React:**
   - `FreeTierReferenceTable.tsx` - Tabla de proveedores
   - `UsageProfilesTable.tsx` - Calculadora interactiva
   - `page.tsx` - Página principal

### ✅ Modelo Actualizado

**Gemini 2.5 Flash (Google AI Studio):**
- ✅ Free Tier: **250M tokens/mes** (actualizado desde 100k)
- ✅ Costo Input: $0.3 COP/1k tokens
- ✅ Costo Output: $1.2 COP/1k tokens
- ✅ Renovación: Mensual

## 📊 Proveedores Incluidos

| Proveedor | Modelo | Free Tier | Renovación | Ranking |
|-----------|--------|-----------|------------|---------|
| **Mistral** | Mistral Large | 1B tokens | Mensual | 🥇 Mejor |
| **Google** | Gemini 2.5 Flash | 250M tokens | Mensual | 🥈 Excelente |
| **Cerebras** | Llama 3.3 70B | 30M tokens | Diario | 🥉 Muy Bueno |
| **Groq** | Llama 3.3 70B | 15M tokens | Diario | ⭐ Bueno |
| **DeepSeek** | DeepSeek-V3 | 5M tokens | Una Vez | ⚠️ Limitado |
| **OpenRouter** | DeepSeek R1 | 3M tokens | Diario | ⚠️ Limitado |
| **Cohere** | Command R+ | 2M tokens | Mensual | ⚠️ Limitado |

## 👥 Perfiles de Uso

### 1. Paciente/Estudiante (bajo)
- **Consumo:** 1,600 tokens/mes
- **Conversaciones:** 2/mes
- **Suficiente para:** Todos los proveedores

### 2. Paciente/Estudiante (medio)
- **Consumo:** 6,000 tokens/mes
- **Conversaciones:** 5/mes
- **Suficiente para:** Todos excepto modelos de una sola vez

### 3. Profesional (odontólogo/docente)
- **Consumo:** 12,000 tokens/mes
- **Conversaciones:** 8/mes
- **Suficiente para:** Google, Mistral, Cerebras, Groq

### 4. Admin/Power User
- **Consumo:** 30,000 tokens/mes
- **Conversaciones:** 15/mes
- **Suficiente para:** Google, Mistral, Cerebras, Groq

### 5. Consultorio Completo
- **Consumo:** 75,000 tokens/mes
- **Conversaciones:** 50/mes
- **Suficiente para:** Google, Mistral, Cerebras (limitado), Groq (limitado)

### 6. Instituto Pequeño
- **Consumo:** 120,000 tokens/mes
- **Conversaciones:** 100/mes
- **Suficiente para:** Google (2+ años), Mistral (8+ años)
- **Limitado:** Cerebras (83 días), Groq (41 días)

### 7. Instituto Mediano
- **Consumo:** 360,000 tokens/mes
- **Conversaciones:** 300/mes
- **Suficiente para:** Google (694 días), Mistral (2,777 días)
- **Muy Limitado:** Todos los demás

## 🎯 Recomendaciones por Caso de Uso

### Para Edutec (Instituto Pequeño - 120k tokens/mes)

**Opción 1: Google Gemini 2.5 Flash** ⭐ ACTUAL
- ✅ 250M tokens gratis/mes
- ✅ Duraría 2,083 meses (173 años) 🎉
- ✅ Modelo rápido y eficiente
- ✅ Multimodal (texto, imagen, código)
- ✅ **MEJOR OPCIÓN** para uso educativo

**Opción 2: Mistral Large**
- ✅ 1B tokens gratis/mes
- ✅ Duraría 8,333 meses (694 años) 🚀
- ⚠️ Más costoso si se excede free tier
- ✅ Excelente para código

**Opción 3: Groq (Llama 3.3 70B)**
- ⚠️ 15M tokens/día = 450M tokens/mes
- ✅ Suficiente (3,750 días = 10 años)
- ✅ Ultra rápido (inferencia)
- ⚠️ Renovación diaria (más complejo de trackear)

### Para Instituto Mediano (360k tokens/mes)

**Opción 1: Mistral Large** ⭐ RECOMENDADO
- ✅ 1B tokens/mes
- ✅ Duraría 2,777 meses (231 años)
- ✅ Único proveedor "ilimitado" para este perfil

**Opción 2: Google Gemini 2.5 Flash**
- ✅ 250M tokens/mes
- ⚠️ Duraría 694 meses (57 años) - Aún excelente
- ✅ Menor costo post free-tier

**Opción 3: Hybrid (Multi-provider)**
- 🔄 Usar Gemini como primario
- 🔄 Groq/Cerebras para casos específicos
- ✅ Maximiza free tiers disponibles

## 🚀 Cómo Usar la Referencia

### 1. Acceder a la Página

```
URL: http://localhost:3000/admin/agentes/referencia
```

Solo accesible para SUPER_ADMIN y MARKETING.

### 2. Seleccionar Perfil de Uso

En la interfaz, selecciona uno de los 7 perfiles:
- Click en el perfil deseado
- La tabla se actualiza automáticamente
- Muestra duración estimada para cada proveedor

### 3. Comparar Proveedores

La tabla muestra:
- ✅ **Verde (Suficiente):** Dura >1 año o es ilimitado
- ⚠️ **Amarillo (Limitado):** Dura 1-12 meses
- 🔴 **Rojo (Insuficiente):** Dura <1 mes

### 4. Tomar Decisiones

Basado en:
- Consumo esperado del cliente
- Tipo de institución (pequeña, mediana, grande)
- Necesidad de multimodalidad
- Velocidad requerida

## 📈 Calculadora de Duración

La fórmula usada es:

```typescript
Duración (días) = Free Tokens / (Tokens por Mes / 30)
```

Para renovación MONTHLY:
```
Si duración > 365 días → "Ilimitado (>1 año)"
```

Para renovación DAILY:
```
Tokens disponibles = Free Tokens * 30 (tokens/mes)
```

## 🔧 Scripts Disponibles

### Actualizar Límites de Gemini

```bash
npx tsx scripts/update-gemini-limits.ts
```

Actualiza el modelo Gemini a los valores correctos:
- Free tier: 250M tokens
- Pricing actualizado
- Nombre: Gemini 2.5 Flash

### Probar Sistema de Tracking

```bash
npx tsx scripts/test-ai-tracking.ts
```

Muestra:
- Estado actual del modelo
- Tokens consumidos
- Free tier usado
- Estadísticas generales

## 💡 Tips de Optimización

### Reducir Consumo de Tokens

1. **Prompts más concisos:**
   - ❌ "Por favor, podrías explicarme detalladamente..."
   - ✅ "Explica brevemente..."

2. **Cachear respuestas comunes:**
   - Preguntas frecuentes
   - Información estática del instituto

3. **Usar system prompts eficientes:**
   - Evitar contexto innecesario
   - Instrucciones claras y breves

4. **Limitar historial de conversación:**
   - Solo últimos 5-10 mensajes
   - Limpiar contexto antiguo

### Maximizar Free Tier

1. **Seleccionar el proveedor adecuado:**
   - Instituto pequeño → Gemini o Mistral
   - Instituto mediano → Mistral
   - Power users → Considerar Groq (rápido)

2. **Hybrid approach:**
   - Tareas simples → Gemini (barato)
   - Código complejo → Mistral (especializado)
   - Respuestas rápidas → Groq (velocidad)

3. **Monitoreo activo:**
   - Revisar dashboard semanalmente
   - Identificar usuarios con alto consumo
   - Educar sobre uso eficiente

## 📊 Estado Actual

**Modelo en Uso:** Gemini 2.5 Flash (Google)

**Configuración:**
```json
{
  "name": "Gemini 2.5 Flash",
  "provider": "Google AI Studio",
  "freeTokensLimit": 250000000,
  "inputCostPer1k": 0.3,
  "outputCostPer1k": 1.2,
  "resetPeriod": "MONTHLY"
}
```

**Para Edutec (120k tokens/mes):**
- ✅ Duración estimada: 2,083 meses (173 años)
- ✅ Estado: Ilimitado
- ✅ Free tier suficiente: SÍ
- ✅ Necesita plan de pago: NO (en el futuro lejano)

## 🎉 Conclusión

Con **Gemini 2.5 Flash** y 250M tokens gratis/mes:
- ✅ **100% de los perfiles** están cubiertos por >1 año
- ✅ Instituto pequeño (120k/mes): **173 años** de free tier
- ✅ Instituto mediano (360k/mes): **57 años** de free tier
- ✅ Sin necesidad de pagar en el corto-mediano plazo
- ✅ Tracking implementado y funcionando

**Próximos pasos:**
1. ✅ Monitorear consumo real
2. 📊 Revisar dashboard semanalmente
3. 🔄 Considerar Mistral si el consumo aumenta dramáticamente
4. 💡 Optimizar prompts para reducir tokens

---

**Documentos Relacionados:**
- `docs/AI_AGENT_TRACKING.md` - Sistema de tracking
- `docs/AI_AGENT_TRACKING_DEV.md` - Guía de desarrollo
- `docs/TESTING_GUIDE.md` - Guía de pruebas
- `src/data/ai-models-free-tier.json` - Datos estructurados

**Última actualización:** Febrero 2026
