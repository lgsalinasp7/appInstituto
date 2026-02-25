# Playbook Operativo - Flujo Comercial (sin WhatsApp automatico)

## 1) Objetivo y alcance

Este playbook define como operar campanas comerciales cuando WhatsApp se gestiona de forma manual por direccion comercial (fuera de automatizaciones), usando:

- Captacion por landing.
- Nutricion por email.
- Seguimiento y priorizacion con agentes IA (Margy y Kaled).
- Reportes ejecutivos por Telegram.
- Gestion de ejecucion en Kanban de tareas.

Flujo objetivo:

`Anuncio -> Landing de Aplicacion -> Confirmacion -> Email -> Masterclass -> Cierre`

## 2) Mapa operativo del flujo

### Etapas y puntos de control

1. **Anuncio**
   - Entrada de trafico con UTMs.
   - Control: trazabilidad de `utm_campaign` en leads capturados.

2. **Landing de Aplicacion**
   - Captura de datos clave del lead.
   - Control: tasa de conversion vista -> registro.

3. **Pagina de Confirmacion**
   - Confirmacion inmediata y siguientes pasos.
   - Control: porcentaje que llega a confirmacion.

4. **Email**
   - Secuencia automatizada pre y post masterclass.
   - Control: apertura, clic y respuesta a CTA de avance.

5. **Masterclass**
   - Conversion intermedia critica.
   - Control: registro -> asistencia.

6. **Cierre**
   - Accion comercial humana (llamada o reunion).
   - Control: asistencia -> llamada -> matricula.

7. **Operacion interna**
   - Margy/Kaled orientan decisiones.
   - Kanban asegura ejecucion.
   - Telegram acelera accion diaria y semanal.

## 3) Frontera de responsabilidades de agentes

## Margy (ejecucion comercial diaria)

### Llega hasta

- Priorizacion diaria de leads.
- Calificacion de temperatura (frio/tibio/caliente) con recomendacion de siguiente paso.
- Deteccion de urgencias de seguimiento.
- Sugerencia y/o creacion de tareas operativas en Kanban.

### No llega en esta fase

- No envia auto-respuestas por WhatsApp.
- No realiza cierre final de venta.
- No reemplaza al asesor en interaccion humana de cierre.

### Entregables esperados de Margy

- Lista diaria de leads a contactar (Top N).
- Razon de prioridad por lead.
- Accion sugerida por lead (llamar, reagendar, nutrir, escalar).

## Kaled (estrategia y analitica comercial)

### Llega hasta

- Analisis de rendimiento de campanas y embudo.
- Briefing de cierre por lead de alto potencial.
- Identificacion de cuellos de botella por etapa.
- Recomendaciones de optimizacion de presupuesto, foco y proceso.

### No llega en esta fase

- No ejecuta contacto operativo lead a lead.
- No automatiza mensajeria externa.
- No sustituye la decision final comercial.

### Entregables esperados de Kaled

- Informe tactico semanal de embudo.
- Lista de campanas a escalar/pausar con justificacion.
- Briefing accionable para cierres prioritarios.

## 4) Rutas y componentes operativos existentes

- Operacion comercial consolidada:
  - `/admin/agentes-comerciales`
- Chat de agentes:
  - Margy y Kaled con streaming en un solo panel.
- Kanban de tareas:
  - Columnas: `PENDIENTE`, `EN_PROCESO`, `COMPLETADA`, `MEJORA`.
  - Creacion manual de tarea disponible para direccion/operacion.
- Telegram:
  - Configuracion de Chat ID y envio de prueba.
  - Reporte diario y semanal por cron con `CRON_SECRET`.

## 5) Ocho casos de uso simulados (que esperar)

Formato comun por caso:
- Contexto.
- Trigger.
- Comportamiento esperado del sistema.
- Resultado esperado de Margy/Kaled.
- Evidencia esperada en Telegram/Kanban.
- Criterio de exito.

### Caso 1 - Registro de alto intento desde landing

- **Contexto:** Lead llega con UTM de campana de alta intencion.
- **Trigger:** Completa formulario en landing y llega a confirmacion.
- **Sistema:** Crea lead, registra origen de campana y lo deja listo para seguimiento.
- **Margy:** Lo prioriza en Top diario y recomienda contacto en ventana corta.
- **Telegram:** Incluye nuevo lead dentro de resumen diario.
- **Kanban:** Tarea operativa de primer contacto en `PENDIENTE`.
- **Exito:** Primer contacto dentro de SLA definido.

### Caso 2 - Registro tibio con nutricion por email

- **Contexto:** Lead se registra pero no muestra accion inmediata.
- **Trigger:** Entra a secuencia de email.
- **Sistema:** Dispara correos de warming.
- **Margy:** Recalifica prioridad tras interacciones de email.
- **Telegram:** Muestra volumen de nuevos y alerta segun nivel de estancados.
- **Kanban:** Tarea de seguimiento diferido con fecha objetivo.
- **Exito:** Lead avanza de tibio a contacto efectivo.

### Caso 3 - Baja confirmacion previa a masterclass

- **Contexto:** Muchos registros y baja intencion de asistencia.
- **Trigger:** 24h antes de masterclass con baja tasa esperada.
- **Sistema:** Mantiene secuencias activas y datos de conversion.
- **Kaled:** Detecta cuello en tramo registro -> asistencia y propone accion correctiva.
- **Telegram:** Alerta de riesgo en reporte diario/semanal.
- **Kanban:** Tareas tacticas (recordatorio manual, reasignacion de llamados).
- **Exito:** Mejora de asistencia en siguiente cohorte.

### Caso 4 - Post masterclass con leads calientes

- **Contexto:** Cohorte finalizada con varios leads calientes.
- **Trigger:** Actualizacion de estado post evento.
- **Sistema:** Conserva trazabilidad por etapa.
- **Margy:** Prioriza cierres inmediatos.
- **Kaled:** Entrega briefing de cierre para los leads top.
- **Telegram:** Lista de accion prioritaria de cierre.
- **Kanban:** Tareas de cierre en `EN_PROCESO`.
- **Exito:** Incremento de tasa asistencia -> cierre.

### Caso 5 - Campana con CPL alto

- **Contexto:** Campana consume presupuesto con bajo rendimiento.
- **Trigger:** Reporte semanal evidencia CPL sobre umbral.
- **Sistema:** Entrega metricas comparativas.
- **Kaled:** Recomienda pausar, ajustar segmentacion o creatividades.
- **Telegram:** Bloque "campanas a pausar" o alerta de CPL.
- **Kanban:** Tarea estrategica para ajuste de campana.
- **Exito:** Reduccion de CPL en ciclo siguiente.

### Caso 6 - Lead estancado en etapa intermedia

- **Contexto:** Lead sin movimiento por varios dias.
- **Trigger:** Detectado en reporte de estancados.
- **Sistema:** Identifica estancamiento y lo reporta.
- **Margy:** Sugiere accion concreta de reactivacion.
- **Telegram:** Muestra conteo de estancados y alerta del dia.
- **Kanban:** Tarea de recuperacion con prioridad alta.
- **Exito:** Lead sale de estancamiento en 48h-72h.

### Caso 7 - Semana de alto volumen operativo

- **Contexto:** Pico de leads por incremento de trafico.
- **Trigger:** Reporte diario con volumen por encima de capacidad.
- **Sistema:** Mantiene consolidacion de datos.
- **Margy:** Reordena prioridad por urgencia y valor potencial.
- **Kaled:** Propone rebalanceo de foco por etapas.
- **Telegram:** Alerta operacional para reasignar esfuerzo.
- **Kanban:** Distribucion de tareas con control de WIP.
- **Exito:** No crece backlog critico en `PENDIENTE`.

### Caso 8 - Cierre exitoso y aprendizaje de ciclo

- **Contexto:** Conversion de lead prioritario a matricula.
- **Trigger:** Cierre confirmado.
- **Sistema:** Refleja avance de etapa final y metricas.
- **Margy:** Marca tarea de seguimiento como completada.
- **Kaled:** Registra patron de cierre replicable.
- **Telegram:** Impacto en resumen semanal.
- **Kanban:** Cierre de tareas y creacion de mejora en `MEJORA`.
- **Exito:** Aprendizaje aplicado a siguientes cohortes.

## 6) Protocolo de lectura y accion de Telegram

## Reporte diario (operativo)

Orden de lectura (max 10 minutos):
1. Leads nuevos.
2. Leads calientes.
3. Leads estancados.
4. Top campanas.
5. Alerta del dia.

Regla de accion:
- Si hay alerta, debe convertirse en tarea Kanban con responsable y vencimiento.
- Si no hay alerta, crear al menos 1 tarea preventiva de mejora.

SLA de reaccion:
- Alerta critica: crear tarea en <= 30 minutos.
- Alerta media: crear tarea en <= 2 horas.

## Reporte semanal (tactico)

Orden de lectura (max 30 minutos):
1. CPL global y variacion.
2. Campanas a escalar/pausar.
3. Lista de leads prioritarios de cierre.
4. Proximos pasos sugeridos.

Regla de accion:
- Toda recomendacion de escala/pausa debe terminar en tarea estrategica.
- Toda lista de leads prioritarios debe terminar en tareas de cierre con fecha.

## 7) Reglas Kanban (agentes + tareas manuales)

## Tipos de tarea

- **Operativa:** contacto, seguimiento, reagendamiento.
- **Analitica:** diagnostico de embudo/campana.
- **Estrategica:** cambios de pauta, mensajes, oferta.
- **Cierre:** preparacion y ejecucion de cierre.

## Estados

Flujo minimo:

`PENDIENTE -> EN_PROCESO -> COMPLETADA`

Estado adicional:

`MEJORA` para ajustes de proceso y experimentos.

## Asignacion

- Tu equipo puede crear tareas manuales en cualquier momento.
- Margy/Kaled pueden sugerir o generar tareas segun hallazgos.
- Toda tarea debe incluir: objetivo, responsable, fecha limite y criterio de termino.

## WIP y SLA sugeridos

- **WIP maximo por columna (base):**
  - `PENDIENTE`: 15
  - `EN_PROCESO`: 8
  - `MEJORA`: 6
- **SLA por tipo:**
  - Operativa: inicio <= 4 horas habiles
  - Cierre: inicio <= 2 horas habiles
  - Analitica: inicio <= 24 horas
  - Estrategica: decision <= 72 horas

## 8) KPIs y criterios de aceptacion

## KPIs de velocidad comercial

- Tiempo de primera accion sobre lead prioritario.
- Tiempo medio de resolucion de tareas por tipo.
- Backlog en `PENDIENTE` y tasa de envejecimiento de tareas.

## KPIs de conversion del embudo

- Landing -> Registro.
- Registro -> Asistencia.
- Asistencia -> Cierre.
- Cierre -> Matricula.

## KPIs de eficiencia de campana

- CPL promedio semanal.
- Tendencia de CPL (sube/baja).
- Campanas escaladas/pausadas y resultado posterior.

## KPIs de calidad operativa de agentes

- Porcentaje de recomendaciones de Margy ejecutadas.
- Porcentaje de recomendaciones de Kaled implementadas.
- Tasa de cierre en leads con briefing de Kaled.

## Criterios de aceptacion del flujo

- Telegram produce acciones concretas en Kanban cada dia/semana.
- Las responsabilidades Margy/Kaled se cumplen sin solapamientos criticos.
- El equipo mantiene backlog saludable y cumple SLA.
- Se observa mejora sostenida en conversion y/o CPL durante 2-4 semanas.

## 9) Riesgos y controles

- **Riesgo:** Dependencia de gestion manual por WhatsApp.
  - **Control:** checklist diario y tareas explicitas de seguimiento manual.
- **Riesgo:** Sobrecarga operativa.
  - **Control:** limites WIP y priorizacion diaria.
- **Riesgo:** Reportes sin ejecucion.
  - **Control:** convertir cada alerta/recomendacion en tarea con responsable.

## 10) Cadencia de gobierno recomendada

- **Daily (15 min):** revisar reporte diario + priorizar Kanban.
- **Semanal (45 min):** revisar reporte semanal + decisiones de campana.
- **Quincenal (60 min):** retrospectiva de conversion, SLA y calidad de tareas.

