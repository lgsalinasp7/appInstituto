# ✅ Checklist de Despliegue - Agente IA

## Pre-despliegue

### 1. Variables de Entorno
- [ ] `GROQ_API_KEY` configurada en producción
- [ ] `NEXT_PUBLIC_AI_ENABLED` configurada según ambiente
- [ ] API Key de Groq válida y con cuota disponible

### 2. Base de Datos
- [ ] Migración de Prisma ejecutada en producción
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Tablas `AiConversation` y `AiMessage` creadas
- [ ] Indexes en `userId`, `tenantId`, `createdAt`

### 3. Dependencias
- [ ] `ai@^6.x` instalada
- [ ] `@ai-sdk/groq@^3.0.24` instalada
- [ ] `zod-to-json-schema@^3.x` instalada

### 4. Build
- [ ] Build de Next.js exitoso
  ```bash
  npm run build
  ```
- [ ] No hay errores TypeScript
- [ ] Tests pasan (137/137 ✅)

---

## Despliegue

### 5. Verificación de Archivos
- [ ] Todos los archivos del módulo `chat/` presentes
- [ ] API routes en `api/chat/` presentes
- [ ] Componentes en `components/chat/` presentes
- [ ] Hook `useChat.ts` presente
- [ ] Integración en `ProtectedLayoutClient.tsx`

### 6. Configuración de Ambiente

**Desarrollo:**
```env
NODE_ENV=development
NEXT_PUBLIC_AI_ENABLED=true
```

**Producción (inicialmente deshabilitado):**
```env
NODE_ENV=production
NEXT_PUBLIC_AI_ENABLED=false  # Cambiar a true cuando esté listo
```

---

## Post-despliegue

### 7. Pruebas Funcionales

#### Básicas
- [ ] Botón flotante visible en desarrollo
- [ ] Abrir/cerrar ventana de chat
- [ ] Enviar mensaje simple
- [ ] Ver streaming en tiempo real
- [ ] Cerrar y reabrir chat (persistencia)

#### Herramientas
- [ ] Probar `getStudentStats`: "¿Cuál es el recaudo del día?"
- [ ] Probar `getProgramInfo`: "Muéstrame los programas disponibles"
- [ ] Probar `getCarteraReport`: "Dame un resumen de cartera"
- [ ] Probar `searchStudents`: "Busca estudiantes con nombre Juan"

#### Conversaciones
- [ ] Crear nueva conversación
- [ ] Ver historial de conversaciones
- [ ] Cargar conversación anterior
- [ ] Eliminar conversación

#### Multi-tenant
- [ ] Cambiar de tenant (slug diferente)
- [ ] Verificar que solo ve sus conversaciones
- [ ] Verificar que herramientas filtran por tenant

### 8. Monitoreo

- [ ] Logs de errores en Groq API
- [ ] Rate limiting (30 req/min)
- [ ] Latencia de respuestas
- [ ] Uso de tokens

### 9. Documentación

- [ ] Equipo de soporte conoce las capacidades
- [ ] Usuarios beta informados
- [ ] Guía de uso preparada

---

## Rollback Plan

Si algo falla:

1. **Deshabilitar rápidamente:**
   ```env
   NEXT_PUBLIC_AI_ENABLED=false
   ```
   Redeploy → Botón flotante no se mostrará

2. **Revertir código (si necesario):**
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Limpiar BD (si necesario):**
   ```sql
   DELETE FROM "AiMessage";
   DELETE FROM "AiConversation";
   ```

---

## Límites y Cuotas

### Groq (Tier Gratuito)
- **Requests/día:** ~6,000
- **Requests/min:** ~30
- **Context window:** 32k tokens

**Estimación de uso:**
- Promedio: 5 mensajes/conversación
- Promedio: 200 tokens/mensaje
- ~1,000 tokens/conversación
- Aprox. 30 conversaciones/hora antes de rate limit

### Escalabilidad

Si se necesita más cuota:
1. Upgrade a tier pago de Groq
2. Implementar cola (queue) para requests
3. Considerar cache de respuestas comunes
4. Agregar rate limiting por usuario

---

## Métricas de Éxito

### Semana 1
- [ ] 50+ conversaciones creadas
- [ ] 80%+ de respuestas exitosas
- [ ] <5% de errores
- [ ] Feedback positivo de usuarios beta

### Mes 1
- [ ] 500+ conversaciones
- [ ] 3+ herramientas usadas regularmente
- [ ] <3% de errores
- [ ] Tiempo de respuesta <5s promedio

---

## Mejoras Futuras

### Corto plazo (1-2 meses)
- [ ] Agregar más herramientas (revenue charts, advisor reports)
- [ ] Analytics de preguntas frecuentes
- [ ] Export de conversaciones a PDF

### Mediano plazo (3-6 meses)
- [ ] RAG con documentación de la plataforma
- [ ] Fine-tuning para dominio específico
- [ ] Multi-idioma (inglés, portugués)
- [ ] Voice input

### Largo plazo (6+ meses)
- [ ] Agente proactivo (notificaciones inteligentes)
- [ ] Integración con WhatsApp
- [ ] Análisis predictivo

---

## Contacto de Soporte

**Errores críticos:**
- Revisar logs en Vercel/Railway
- Verificar status de Groq API: https://status.groq.com/
- Verificar quota en Groq Console: https://console.groq.com/

**Dudas técnicas:**
- Ver documentación en `src/modules/chat/README.md`
- Ver plan original en `AI_AGENT_IMPLEMENTATION.md`

---

## Checklist Final ✨

Antes de marcar como "Producción lista":

- [ ] Todos los items de Pre-despliegue completados
- [ ] Todos los items de Despliegue completados
- [ ] Al menos 5 pruebas funcionales exitosas
- [ ] Métricas de éxito definidas
- [ ] Plan de rollback preparado
- [ ] Equipo entrenado
- [ ] Documentación actualizada

**Firma de aprobación:**
- Desarrollador: ________________ Fecha: ______
- QA: ________________ Fecha: ______
- Product Owner: ________________ Fecha: ______
