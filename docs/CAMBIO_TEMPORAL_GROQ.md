# Cambio Temporal a Groq - 20 Feb 2026

## 🚨 Problema Detectado

**Fecha:** 20 de febrero de 2026
**Hora:** ~16:00 COT

El agente IA en EDUTEC no estaba dando respuestas válidas. Al revisar los logs del servidor, se detectó:

```
Error [AI_RetryError]: Failed after 3 attempts. Last error:
You exceeded your current quota, please check your plan and billing details.

* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
* limit: 0, model: gemini-2.0-flash
```

**Causa raíz:** La API key de Google Gemini muestra límites de cuota en **0**, indicando que:
- La API key no tiene free tier habilitado, O
- La API key es inválida/expiró, O
- Hay problemas de facturación en Google Cloud

---

## ✅ Solución Implementada

### Cambio Temporal a Groq

Se implementó un cambio temporal de **Google Gemini 2.0 Flash** a **Groq (Llama 3.3 70B Versatile)** para mantener el servicio funcionando mientras se resuelve el problema con Google.

### Archivos Modificados

1. **`src/app/api/chat/stream/route.ts`**
   - Import cambiado de `google` a `groq`
   - Modelo cambiado de `gemini-2.0-flash` a `llama-3.3-70b-versatile`
   - Token tracking actualizado al nuevo modelo

2. **Base de Datos**
   - Script: `scripts/seed-groq-model.ts`
   - Modelo Groq creado con límites correctos:
     - Free Tier: 15M tokens/día (450M tokens/mes)
     - Reset Period: DAILY
     - Input Cost: $0.059 per 1k tokens
     - Output Cost: $0.079 per 1k tokens
   - Modelo Gemini marcado como inactivo temporalmente

3. **Dashboard UI**
   - `src/app/admin/agentes/page.tsx`: Alerta visual amarilla
   - `src/app/admin/agentes/referencia/page.tsx`: Información actualizada

### Configuración Actual

```typescript
// src/app/api/chat/stream/route.ts
import { groq } from "@ai-sdk/groq";

const result = streamText({
  model: groq("llama-3.3-70b-versatile"),
  // ... resto de config
});

// Token tracking
modelUsed: "llama-3.3-70b-versatile"
```

**Variables de Entorno:**
```env
GROQ_API_KEY="tu-groq-api-key-aqui"
GOOGLE_GENERATIVE_AI_API_KEY="tu-google-api-key-aqui" # ⚠️ PROBLEMA
```

---

## 📊 Comparación: Groq vs Gemini

| Característica | Groq (Actual) | Gemini (Ideal) |
|----------------|---------------|----------------|
| **Modelo** | Llama 3.3 70B Versatile | Gemini 2.0 Flash |
| **Free Tier** | 15M tokens/día | 250M tokens/mes |
| **Free Tier Mensual** | 450M tokens/mes | 250M tokens/mes |
| **Reset Period** | Diaria | Mensual |
| **Input Cost** | $0.059/1M tokens | $0.075/1M tokens |
| **Output Cost** | $0.079/1M tokens | $0.30/1M tokens |
| **Multimodal** | ❌ No (solo texto) | ✅ Sí (texto, imagen, video) |
| **Velocidad** | ⚡ Ultra rápido | 🚀 Rápido |
| **Context Window** | 32k tokens | 1M tokens |

### Ventajas de Groq (Temporal)
- ✅ **Mayor free tier mensual:** 450M vs 250M tokens
- ✅ **Ultra rápido:** Inferencia más rápida que Gemini
- ✅ **Funcional:** Mantiene el servicio activo
- ✅ **Gratis:** Dentro de free tier para uso actual

### Desventajas de Groq
- ⚠️ **No multimodal:** Solo texto (Gemini soporta imágenes/video)
- ⚠️ **Context window menor:** 32k vs 1M tokens
- ⚠️ **Reset diario:** Más complejo de trackear que mensual
- ⚠️ **Costo post-tier:** Más caro que Gemini si se excede

---

## 🔧 Cómo Volver a Gemini (Cuando se Arregle)

### Paso 1: Arreglar API Key de Google

1. Ve a **Google AI Studio:** https://aistudio.google.com/app/apikey
2. Verifica tu API key actual o crea una nueva
3. Asegúrate de que el free tier esté habilitado
4. Copia la nueva API key

### Paso 2: Actualizar `.env`

```env
GOOGLE_GENERATIVE_AI_API_KEY="tu-nueva-api-key-aqui"
```

### Paso 3: Ejecutar Script de Reversión

Crear y ejecutar script para reactivar Gemini:

```bash
npx tsx scripts/reactivate-gemini.ts
```

Script:
```typescript
// scripts/reactivate-gemini.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Activar Gemini
  await prisma.aiModel.updateMany({
    where: { modelIdentifier: "gemini-2.0-flash" },
    data: { isActive: true }
  });

  // Desactivar Groq
  await prisma.aiModel.updateMany({
    where: { modelIdentifier: "llama-3.3-70b-versatile" },
    data: { isActive: false }
  });

  console.log("✅ Gemini reactivated, Groq deactivated");
}

main();
```

### Paso 4: Actualizar Código

```typescript
// src/app/api/chat/stream/route.ts

// CAMBIAR:
import { groq } from "@ai-sdk/groq";
const result = streamText({
  model: groq("llama-3.3-70b-versatile"),
  // ...
});
modelUsed: "llama-3.3-70b-versatile"

// POR:
import { google } from "@ai-sdk/google";
const result = streamText({
  model: google("gemini-2.0-flash"),
  // ...
});
modelUsed: "gemini-2.0-flash"
```

### Paso 5: Actualizar Dashboard

Remover alertas amarillas en:
- `src/app/admin/agentes/page.tsx`
- `src/app/admin/agentes/referencia/page.tsx`

Actualizar modelo actual a Gemini.

### Paso 6: Reiniciar Servidor

```bash
npm run dev
```

### Paso 7: Verificar

1. Probar chat en EDUTEC
2. Verificar que responda correctamente
3. Revisar dashboard de agentes
4. Confirmar que tokens se registren con `gemini-2.0-flash`

---

## 📈 Análisis de Uso con Groq

### Para EDUTEC (Instituto Pequeño - 120k tokens/mes)

**Con Groq (15M tokens/día = 450M/mes):**
```
450,000,000 / 120,000 = 3,750 días = 10.3 años
```

✅ **Conclusión:** Groq es más que suficiente incluso para uso prolongado.

### Escenarios de Consumo

| Perfil | Tokens/Mes | Duración con Groq | Estado |
|--------|-----------|-------------------|---------|
| **Instituto Pequeño** | 120k | 10+ años | ✅ Excelente |
| **Instituto Mediano** | 360k | 3.4 años | ✅ Muy Bueno |
| **Instituto Grande** | 1M | 1.2 años | ⚠️ Limitado |

---

## ⚠️ Monitoreo Recomendado

### Durante Uso de Groq

1. **Revisar Dashboard Diariamente:**
   - URL: http://localhost:3000/admin/agentes
   - Verificar consumo diario < 15M tokens

2. **Alertas a Configurar:**
   - 80% de 15M tokens/día (12M tokens) → Warning
   - 90% de 15M tokens/día (13.5M tokens) → Urgente

3. **Tracking de Tendencias:**
   - Usar gráficos de tendencias
   - Identificar picos de consumo
   - Optimizar prompts si es necesario

### Indicadores de Éxito

- ✅ Chat responde correctamente
- ✅ Tokens se registran en BD
- ✅ Dashboard muestra estadísticas
- ✅ No errores de cuota

---

## 📚 Referencias

- **Groq Docs:** https://console.groq.com/docs/models
- **Llama 3.3 70B:** https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_3
- **Vercel AI SDK:** https://sdk.vercel.ai/providers/ai-sdk-providers/groq
- **Dashboard Admin:** http://localhost:3000/admin/agentes
- **Referencia Free Tier:** http://localhost:3000/admin/agentes/referencia

---

## ✅ Checklist de Cambio

- [x] API key de Groq verificada en `.env`
- [x] Modelo Groq seedeado en base de datos
- [x] Modelo Gemini marcado como inactivo
- [x] Código actualizado en `chat/stream/route.ts`
- [x] Import cambiado a `@ai-sdk/groq`
- [x] Token tracking actualizado
- [x] Dashboard actualizado con alertas
- [x] Página de referencia actualizada
- [x] Servidor reiniciado exitosamente
- [x] Documentación creada
- [ ] **PENDIENTE:** Probar chat en EDUTEC
- [ ] **PENDIENTE:** Verificar respuestas del agente
- [ ] **PENDIENTE:** Arreglar API key de Google para volver a Gemini

---

**Última actualización:** 20 de febrero de 2026 - 16:10 COT
**Próxima revisión:** Cuando se arregle API key de Google Gemini
**Responsable:** Admin KaledSoft

---

## 🎯 Objetivo Final

**Volver a Google Gemini 2.0 Flash** una vez se resuelva el problema de la API key, porque ofrece:
- ✅ Mejor free tier para uso a largo plazo
- ✅ Multimodal (futuras expansiones)
- ✅ Context window de 1M tokens
- ✅ Reset mensual (más simple de trackear)

**Groq es una solución temporal excelente**, pero Gemini es el objetivo a largo plazo.
