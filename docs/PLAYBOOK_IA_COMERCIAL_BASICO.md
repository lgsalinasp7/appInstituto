# Playbook Operativo IA Comercial Basico

## Objetivo

Operar Margy y Kaled de forma visible y util para el equipo comercial, sin depender de Meta Ads API ni WhatsApp Business API, usando tracking UTM basico, carga manual de costos y reportes por Telegram.

## Alcance de esta etapa

- Dos agentes IA visibles en frontend:
  - Margy: seguimiento y calificacion.
  - Kaled: cierre y estrategia.
- Tracking UTM basico:
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`.
- Carga manual de costos de campana por CSV.
- Reportes diarios y semanales por Telegram.

## Paso 1: Alineacion operativa

### Roles minimos

- Trafficker:
  - Publica campanas.
  - Garantiza que cada URL salga con UTM completo.
  - Exporta y sube costos.
- Comercial:
  - Ejecuta seguimiento de leads.
  - Usa chats de Margy y Kaled para priorizacion y cierre.
- Lider operativo:
  - Revisa KPIs diarios.
  - Define ajustes semanales.

### Cadencia recomendada

- Diario:
  - 09:00: revisar resumen Telegram.
  - 11:00: revisar leads nuevos y estancados.
  - 16:00: actualizar estados de embudo.
- Semanal (lunes):
  - Revisar rendimiento por campana.
  - Decidir escalado, pausa o ajuste de mensajes/oferta.

### Decisiones semanales obligatorias

- Campanas a escalar.
- Campanas a pausar.
- Oferta/mensaje a ajustar.
- Lista de leads calientes a cierre inmediato.

## Paso 2: Chat visible de agentes en frontend

### Estructura funcional de la vista

- Vista unica con:
  - Panel Margy.
  - Panel Kaled.
  - Selector de prospecto (opcional).
  - Historial corto por agente.
- Separar claramente:
  - Chat general del sistema.
  - Chat comercial Margy/Kaled.

### Flujo operativo esperado

- Margy:
  - Detecta prioridad de seguimiento.
  - Sugiere acciones de contacto.
  - Propone tareas de seguimiento.
- Kaled:
  - Propone estrategia de cierre por lead.
  - Detecta objeciones.
  - Prioriza leads con mayor probabilidad de matricula.

### Criterio de aceptacion de este paso

- El equipo comercial puede abrir frontend, ver ambos agentes y conversar con cada uno de forma separada.

## Paso 3: Tracking UTM basico

### Politica UTM

Ninguna campana sale en produccion sin:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`

### Convencion sugerida

- `utm_source=facebook`
- `utm_medium=paid_social`
- `utm_campaign={objetivo}_{producto}_{mes}`
- `utm_content={angulo}_{creativo}_{formato}`

### Checklist previo a publicar anuncios

- URL final abre correctamente.
- UTM presentes y no vacios.
- `utm_campaign` y `utm_content` legibles.
- Landing de gracias activa.

### Criterio de aceptacion de este paso

- Cada lead nuevo puede asociarse a una `utm_campaign` y `utm_content`.

## Paso 4: Carga manual de costos por CSV

### Frecuencia

- Ideal: diaria.
- Minimo: lunes, miercoles y viernes.

### Plantilla CSV estandar

```csv
date,campaign,adset,ad,spend_cop,impressions,clicks
2026-02-24,Campana_Masterclass_Feb,Intereses_Educacion,Video_A,185000,12450,392
```

### Reglas de carga

- `date` formato `YYYY-MM-DD`.
- `spend_cop` sin simbolos, solo numero.
- Si no se usa adset/ad en fase basica, enviar valor `N/A`.
- No mezclar periodos en un mismo archivo.

### Criterio de aceptacion de este paso

- El sistema tiene costos actualizados para calcular CPL basico por campana.

## Paso 5: Tablero operativo basico

### KPIs minimos

- Leads por campana.
- CPL por campana.
- Conversion por etapa:
  - NUEVO -> INTERESADO
  - INTERESADO -> CIERRE
- Leads estancados (sin avance de etapa en X dias).

### Definiciones rapidas

- CPL: `spend_cop / leads_capturados`.
- Tasa avance etapa: `leads_que_avanzan / leads_en_etapa_origen`.

### Criterio de aceptacion de este paso

- El equipo puede decidir que campanas continuar, pausar o ajustar solo con el tablero.

## Paso 6: Reportes por Telegram

### Reporte diario (09:00)

Formato sugerido:

```text
Resumen Diario Comercial
Fecha: {yyyy-mm-dd}

Leads nuevos: {n}
Leads calientes: {n}
Leads estancados: {n}

Top campanas por leads:
1) {campana_a} - {leads}
2) {campana_b} - {leads}

CPL promedio: {valor_cop}
Alerta: {mensaje_clave}
```

### Reporte semanal (lunes)

Formato sugerido:

```text
Resumen Semanal Comercial
Periodo: {inicio} - {fin}

Gasto total: {cop}
Leads totales: {n}
CPL global: {cop}

Campanas a escalar: {lista}
Campanas a pausar: {lista}
Accion prioritaria de cierre: {texto}
```

### Criterio de aceptacion de este paso

- Los responsables reciben reportes utiles sin entrar al panel.

## Paso 7: Formalizacion del playbook

### Entregables documentales minimos

- Manual de armado de URLs con UTM.
- Proceso de carga CSV de costos.
- Guia de lectura de tablero.
- Guia de uso de chats Margy/Kaled.
- Guia de accion ante alertas (estancados, CPL alto, baja conversion).

### Regla de mantenimiento

- Revisar y actualizar este playbook cada 2 semanas durante la etapa basica.

## Matriz de control semanal

| Bloque | Responsable | Evidencia |
|---|---|---|
| UTM correctos | Trafficker | Lista de URLs verificadas |
| Costos cargados | Trafficker | CSV del periodo cargado |
| Leads priorizados | Comercial | Lista de calientes y estancados |
| Estrategia de cierre | Comercial + Lider | Resumen semanal |
| Ajustes de campana | Lider | Decisiones documentadas |

## Criterio final de exito

- Dos agentes IA visibles y usados en frontend.
- Trazabilidad basica de origen por UTM.
- CPL calculable sin Meta API.
- Reportes por Telegram operativos.
- Proceso comercial documentado y repetible.
