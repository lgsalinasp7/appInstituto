# LÓGICA DEL NEGOCIO - Instituto de Formación Técnica

> Documento de especificación funcional para validar implementación

---

## 1. INSCRIPCIÓN DE ESTUDIANTES

### 1.1 Datos Requeridos en la Inscripción

| Campo | Requerido | Estado App | Notas |
|-------|-----------|------------|-------|
| Nombre completo | SÍ | ✅ Existe | `fullName` |
| Tipo de identificación (CC/TI) | SÍ | ✅ Existe | `documentType` |
| Número de identificación | SÍ | ✅ Existe | `documentNumber` |
| Número de celular | SÍ | ✅ Existe | `phone` - usado para WhatsApp |
| Nombre del asesor | SÍ | ⚠️ QUITAR | Debe tomarse automático de la autenticación |
| Nombre del programa | SÍ | ✅ Existe | `programId` |
| Valor total del programa | SÍ | ✅ AUTOCOMPLETAR | Se llena al seleccionar programa |
| Cantidad de módulos | SÍ | ✅ AUTOCOMPLETAR | Se llena al seleccionar programa |
| Valor de la matrícula | SÍ | ✅ AUTOCOMPLETAR | Se llena al seleccionar programa |
| Forma de pago (frecuencia) | SÍ | ❌ FALTA | Mensual o Quincenal |
| Fecha del primer compromiso | SÍ | ❌ FALTA | Cuándo debe pagar el primer módulo |

### 1.2 Configuración de Programas (CONFIRMADO)

> **DEFINICIÓN:** Todo se configura por programa en Admin > Configuración

| Campo del Programa | Descripción |
|--------------------|-------------|
| Nombre | Nombre del programa (ej: "Técnico en Enfermería") |
| Valor Total | Precio total del programa |
| Valor Matrícula | Cuota inicial (50k/60k) |
| Cantidad de Módulos | Número de módulos del programa |

**Al seleccionar un programa en la inscripción, se autocompleta:**
- Valor total del programa
- Valor de la matrícula
- Cantidad de módulos
- Valor por módulo (calculado)

### 1.3 Cálculo del Valor por Módulo (CONFIRMADO)

```
Valor por Módulo = (Valor Total del Programa - Matrícula) ÷ Cantidad de Módulos
```

---

## 2. FLUJO DE PAGOS Y MÓDULOS (CONFIRMADO)

### 2.1 Secuencia del Flujo

```
1. INSCRIPCIÓN
   └── Estudiante paga MATRÍCULA (50k/60k)
       └── ❌ NO se entrega ningún módulo aún
       └── Se genera compromiso de pago para Módulo 1 (según frecuencia)
       └── Pago aparece en historial como "MATRÍCULA"

2. PRIMER PAGO (Módulo 1)
   └── Estudiante paga el valor COMPLETO del módulo
       └── ✅ Se le ENTREGA el Módulo 1
           └── Fecha máxima de taller = 5 días ANTES del próximo pago
               └── Se genera compromiso para Módulo 2
       └── Pago aparece en historial como "MÓDULO 1"

N. ÚLTIMO PAGO (Módulo N)
   └── Estudiante paga
       └── Se le entrega último módulo
           └── Saldo = $0 → Programa completado
```

### 2.2 Tipos de Pago

| Tipo | Descripción | Cuándo se hace | Desbloquea |
|------|-------------|----------------|------------|
| **MATRÍCULA** | Pago inicial (50k/60k) | Al inscribirse | Nada - solo registra al estudiante |
| **MÓDULO** | Pago del valor del módulo | Según frecuencia (mensual/quincenal) | El módulo correspondiente |

### 2.3 Reglas del Flujo (CONFIRMADO)

| Regla | Descripción | Estado App |
|-------|-------------|------------|
| Matrícula NO entrega módulo | Al pagar matrícula NO se entrega el primer módulo | ❌ No validado |
| Pago COMPLETO → Módulo | Solo se entrega módulo si paga el valor COMPLETO | ❌ No implementado |
| Sin pago → Bloqueo | Si no paga, no recibe siguiente módulo | ❌ No implementado |
| NO abonos parciales | No se aceptan pagos parciales para módulos | ❌ No validado |
| Sin intereses | Los compromisos no generan intereses ni mora | ✅ Aplica |
| Saldo decreciente | Con cada pago se resta del total | ✅ Existe |

### 2.4 Fecha de Entrega de Talleres (CONFIRMADO)

```
Fecha máxima de taller = Fecha próximo compromiso - 5 días
```

---

## 3. COMPROMISOS DE PAGO (CONFIRMADO)

### 3.1 Generación de Compromisos

> **DEFINICIÓN:** Los compromisos se generan UNO a la vez, después de cada pago.

| Evento | Acción |
|--------|--------|
| Inscripción + Matrícula | Se crea compromiso para Módulo 1 |
| Pago Módulo 1 | Se crea compromiso para Módulo 2 |
| Pago Módulo N | No se crea más compromisos (programa terminado) |

### 3.2 Frecuencia de Pago (CONFIRMADO)

| Frecuencia | Días entre pagos |
|------------|------------------|
| Mensual | 30 días |
| Quincenal | 15 días |

### 3.3 Monto del Compromiso (CONFIRMADO)

> **REGLA:** El monto del compromiso es SIEMPRE igual al valor del módulo. NO se permiten abonos parciales.

---

## 4. NOTIFICACIONES POR WHATSAPP (CONFIRMADO)

### 4.1 Tipos de Notificaciones

| Notificación | Cuándo se envía | Estado App |
|--------------|-----------------|------------|
| Recibo de pago | Al registrar un pago | ✅ Existe |
| Recordatorio 7 días | 7 días antes del vencimiento | ❌ FALTA |
| Recordatorio 3 días | 3 días antes del vencimiento | ❌ FALTA |
| Recordatorio 1 día | 1 día antes del vencimiento | ❌ FALTA |
| Entrega de módulo | Al entregar un módulo + fecha taller | ❌ FALTA |
| Alerta de MORA | Cuando pasa la fecha sin pago | ❌ FALTA |

---

## 5. SEGUIMIENTO DEL RECAUDO

### 5.1 Información Necesaria para Seguimiento

| Información | Descripción | Estado App |
|-------------|-------------|------------|
| Total recaudado | Suma de todos los pagos | ✅ Existe |
| Cartera pendiente | Suma de saldos de estudiantes | ✅ Existe |
| Compromisos vencidos | Pagos que no se hicieron a tiempo | ✅ Existe |
| Estudiantes en mora | Lista de quienes deben (EN ROJO) | ⚠️ Parcial |
| Módulos pendientes por entregar | Estudiantes que pagaron pero no tienen módulo | ❌ FALTA |

### 5.2 Alertas de Cartera (CONFIRMADO)

| Tipo de Alerta | Descripción | Color | Estado App |
|----------------|-------------|-------|------------|
| Vencido/Mora | Compromiso pasó la fecha | 🔴 ROJO | ✅ Existe |
| Hoy | Compromiso vence hoy | 🟠 Naranja | ✅ Existe |
| Próximo 7 días | Compromiso próximo a vencer | 🔵 Azul | ✅ Existe |

---

## 6. ANÁLISIS DE VISTAS

### 6.1 PANEL DE CONTROL (Dashboard) - CONFIRMADO

#### Cambios CONFIRMADOS:

| Cambio | Descripción |
|--------|-------------|
| Quitar "Tasa de Cierre" | Reemplazar por otra métrica |
| Agregar "Recaudo del Día" | Cuánto se ha recaudado HOY |
| Agregar "Cartera en Mora" | Total $$ vencidos (ROJO) |
| Agregar "Meta del Mes" | StatCard con barra de progreso |
| Agregar filtros de tiempo | Semanal, Quincenal, Mensual |
| Agregar filtro por Asesor | Ver ventas por asesor específico |

---

### 6.2 VISTA MATRÍCULAS - CONFIRMADO

> **PROPÓSITO:** Gestión de ESTUDIANTES - inscripción, datos, módulos, pago rápido

#### Mejoras CONFIRMADAS:

**Formulario:**
- Eliminar campo "Estado"
- Eliminar campo "Asesor" (usar sesión)
- Autocompletar al seleccionar programa: valor, matrícula, módulos
- Agregar "Frecuencia de Pago"
- Agregar "Fecha Primer Compromiso"
- Mostrar "Resumen" calculado

**Tabla:**
- Agregar columna "Matrícula Pagada"
- Agregar columna "Módulo Actual" (ej: "2 de 6")
- Agregar indicador de estado (✅ Al día / 🔴 Mora)

---

### 6.3 VISTA RECAUDOS (NUEVA) - CONFIRMADO

> **PROPÓSITO:** Fusiona "Pagos & Recibos" + "Control de Cartera" en una sola vista con tabs

#### Estructura:

```
💰 RECAUDOS
├── Tab "Registrar Pago" ← NUEVO
│   ├── Buscar estudiante por nombre o documento
│   ├── Ver información del estudiante
│   ├── Ver saldo pendiente
│   ├── Ver compromiso actual
│   └── Registrar pago (matrícula o módulo)
│
├── Tab "Historial"
│   ├── Todos los pagos realizados
│   ├── Tipo: MATRÍCULA vs MÓDULO X
│   ├── Filtros: fecha, método, asesor
│   ├── Enviar recibo por WhatsApp ✅
│   ├── Ver detalle
│   └── Exportar
│
└── Tab "Cartera"
    ├── Compromisos VENCIDOS (🔴 rojo)
    ├── Compromisos HOY (🟠 naranja)
    ├── Compromisos PRÓXIMOS (🔵 azul)
    ├── Enviar recordatorio WhatsApp ✅
    ├── Registrar abono
    └── Reprogramar compromiso
```

#### Funcionalidades WhatsApp (MANTENER):
- ✅ Enviar recibo de pago
- ✅ Enviar recordatorio de cartera

---

### 6.4 VISTA PROSPECTOS - OCULTAR

> **DECISIÓN:** No mostrar por ahora. El cliente no lo solicitó.

---

### 6.5 VISTA REPORTES - CONFIRMADO ✅

#### Lo que TIENE actualmente:

| Componente | Descripción | Estado |
|------------|-------------|--------|
| Ventas por Asesor | Ranking de asesores con ventas y recaudo | ✅ OK |
| Distribución de Programas | Gráfico de torta por programa | ⚠️ Revisar datos |
| Cartera Pendiente Detallada | Tabla de deudas | ✅ OK pero duplica Cartera |

#### Lo que FALTA (Recomendación Experto PO):

Para un sistema de recaudo de matrículas de instituto, los reportes esenciales son:

---

**REPORTES DE RECAUDO (Prioridad ALTA)**

| Reporte | Descripción | Prioridad |
|---------|-------------|-----------|
| **Recaudo del Período** | Total recaudado con filtro de fecha (día/semana/mes) | 🔴 ALTA |
| **Recaudo por Método de Pago** | Cuánto se cobró por Bancolombia, Nequi, Efectivo, etc. | 🔴 ALTA |
| **Recaudo por Asesor** | Cuánto recaudó cada asesor (ya existe, mejorar) | 🔴 ALTA |
| **Comparativo Mensual** | Mes actual vs mes anterior (% crecimiento) | 🟡 MEDIA |

**Ejemplo de Reporte de Recaudo:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 REPORTE DE RECAUDO - Enero 2026                          │
├─────────────────────────────────────────────────────────────┤
│ Total Recaudado:          $45,000,000                       │
│ Meta del Mes:             $50,000,000 (90% cumplido)        │
│                                                             │
│ Por Tipo:                                                   │
│   Matrículas:             $8,500,000  (28 estudiantes)      │
│   Módulos:                $36,500,000 (125 pagos)           │
│                                                             │
│ Por Método:                                                 │
│   Bancolombia:            $22,000,000 (49%)                 │
│   Nequi:                  $12,000,000 (27%)                 │
│   Efectivo:               $8,000,000  (18%)                 │
│   Daviplata:              $3,000,000  (6%)                  │
│                                                             │
│ Por Asesor:                                                 │
│   1. María González       $15,000,000                       │
│   2. Carlos Rodríguez     $12,000,000                       │
│   3. Ana Martínez         $10,000,000                       │
│   4. Luis Hernández       $8,000,000                        │
└─────────────────────────────────────────────────────────────┘
```

---

**REPORTES DE CARTERA (Prioridad ALTA)**

| Reporte | Descripción | Prioridad |
|---------|-------------|-----------|
| **Cartera por Antigüedad** | Clasificar deudas: 0-30, 31-60, 61-90, +90 días | 🔴 ALTA |
| **Cartera por Asesor** | Cuánto debe cada asesor (sus estudiantes) | 🔴 ALTA |
| **Cartera por Programa** | Cuánto se debe por programa | 🟡 MEDIA |
| **Tasa de Recuperación** | % de compromisos pagados a tiempo | 🟡 MEDIA |

**Ejemplo de Reporte de Cartera por Antigüedad:**
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 CARTERA POR ANTIGÜEDAD - Enero 2026                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Antigüedad        | Monto         | Estudiantes | % Total   │
│ ------------------|---------------|-------------|-----------|
│ 🟢 0-30 días      | $12,000,000   | 35          | 40%       │
│ 🟡 31-60 días     | $8,000,000    | 22          | 27%       │
│ 🟠 61-90 días     | $5,000,000    | 12          | 17%       │
│ 🔴 +90 días       | $5,000,000    | 8           | 16%       │
│ ------------------|---------------|-------------|-----------|
│ TOTAL             | $30,000,000   | 77          | 100%      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**REPORTES DE MATRÍCULAS (Prioridad MEDIA)**

| Reporte | Descripción | Prioridad |
|---------|-------------|-----------|
| **Matrículas por Mes** | Cuántos estudiantes nuevos por mes | 🟡 MEDIA |
| **Matrículas por Programa** | Distribución de estudiantes por programa | 🟡 MEDIA |
| **Matrículas por Asesor** | Cuántos estudiantes matriculó cada asesor | 🟡 MEDIA |

---

**REPORTES DE MÓDULOS (Prioridad MEDIA)**

| Reporte | Descripción | Prioridad |
|---------|-------------|-----------|
| **Progreso de Estudiantes** | En qué módulo va cada estudiante | 🟡 MEDIA |
| **Módulos Pendientes** | Estudiantes que pagaron pero no se les entregó módulo | 🔴 ALTA |
| **Tasa de Avance** | % promedio de avance por programa | 🟢 BAJA |

---

**FILTROS GLOBALES PARA REPORTES**

| Filtro | Opciones |
|--------|----------|
| **Período** | Hoy, Esta semana, Este mes, Último mes, Rango personalizado |
| **Programa** | Todos, o seleccionar uno específico |
| **Asesor** | Todos, o seleccionar uno específico |
| **Estado** | Todos, Al día, En mora |

---

**EXPORTACIÓN**

| Formato | Descripción |
|---------|-------------|
| Excel/CSV | Para análisis en hojas de cálculo |
| PDF | Para impresión y archivo |

---

#### Propuesta de Estructura de Reportes:

```
📊 REPORTES
├── Tab "Recaudo"
│   ├── Total recaudado (con filtro de período)
│   ├── Gráfico de tendencia (línea)
│   ├── Por método de pago (torta)
│   ├── Por tipo: Matrículas vs Módulos
│   └── Por asesor (tabla ranking)
│
├── Tab "Cartera"
│   ├── Por antigüedad (0-30, 31-60, 61-90, +90)
│   ├── Por asesor
│   ├── Por programa
│   └── Tasa de recuperación
│
├── Tab "Matrículas"
│   ├── Nuevos estudiantes por mes (gráfico)
│   ├── Por programa
│   └── Por asesor
│
└── Tab "Exportar"
    ├── Seleccionar reporte
    ├── Seleccionar formato (Excel/PDF)
    └── Descargar
```

> **✅ CONFIRMADO:** Estructura de reportes aprobada.

> **✅ CONFIRMADO:** El reporte "Cartera Pendiente Detallada" se MUEVE a la Tab de Cartera en Reportes.

> **⭐ SUPER IMPORTANTE:** El reporte de CARTERA es crítico para el negocio. Debe incluir:
> - Exportación a **Excel** y **PDF**
> - Detallado por **vencimientos**: 0-30, 31-60, 61-90, +90 días
> - Filtros por asesor, programa y período

---

## 7. MENÚ DE CONFIGURACIÓN (ADMIN) - CONFIRMADO

### 7.1 Opciones de Configuración

| Configuración | Descripción | Campos |
|---------------|-------------|--------|
| **Programas** | Gestión de programas académicos | Nombre, Valor Total, Valor Matrícula, Cantidad Módulos |
| **Meta del Mes** | Objetivo de recaudo mensual | Monto |
| **Usuarios/Asesores** | Gestión de usuarios del sistema | (existente) |
| **Roles y Permisos** | Qué puede hacer cada tipo de usuario | (existente) |

### 7.2 Gestión de Programas - CONFIRMADO

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ CONFIGURACIÓN > PROGRAMAS                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ + Nuevo Programa                                        ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ | Programa              | Valor Total | Matrícula | Módulos|
│ |----------------------|-------------|-----------|---------|
│ | Técnico en Enfermería| $1,800,000  | $60,000   | 6       |
│ | Auxiliar Salud Oral  | $1,500,000  | $50,000   | 5       |
│ | Técnico en Farmacia  | $1,600,000  | $60,000   | 6       |
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. MENÚ DE NAVEGACIÓN - ACTUALIZADO

### 8.1 Estructura del Menú (CONFIRMADO)

```
📊 Panel de Control
📚 Matrículas
💰 Recaudos           ← FUSIÓN de Pagos + Cartera
📈 Reportes
⚙️ Configuración      ← Solo para Admin

❌ Prospectos         ← OCULTAR por ahora
```

---

## 9. RESUMEN DE BRECHAS

### 9.1 Campos que Faltan en Inscripción

- [ ] Forma/frecuencia de pago (Mensual/Quincenal)
- [ ] Fecha del primer compromiso de pago
- [ ] Autocompletar: valor, matrícula, módulos al seleccionar programa
- [ ] Mostrar resumen calculado (valor por módulo, próximo pago)

### 9.2 Campos a ELIMINAR del Formulario

- [ ] Campo "Estado" (siempre es MATRICULADO)
- [ ] Campo "Asesor" (tomar de autenticación)

### 9.3 Lógica que Falta Implementar

- [ ] Diferenciar pagos: MATRÍCULA vs MÓDULO
- [ ] Validar que pago sea COMPLETO (no parcial) para entregar módulo
- [ ] Conexión: Pago completo → Entrega de módulo
- [ ] Bloqueo de módulo si no hay pago completo
- [ ] Generación automática del siguiente compromiso (uno a la vez)
- [ ] Cálculo de fecha de taller = próximo pago - 5 días
- [ ] Notificación de entrega de módulo por WhatsApp
- [ ] Recordatorios a 7, 3 y 1 día antes del vencimiento
- [ ] Notificación de mora

### 9.4 Mejoras al Dashboard

- [ ] Quitar tarjeta "Tasa de Cierre"
- [ ] Agregar tarjeta "Recaudo del Día"
- [ ] Agregar tarjeta "Cartera en Mora" (rojo)
- [ ] Agregar tarjeta "Meta del Mes" (StatCard con progreso)
- [ ] Agregar filtros de tiempo (Semanal, Quincenal, Mensual)
- [ ] Agregar filtro por Asesor

### 9.5 Mejoras a Vista Matrículas

- [ ] Corregir posición del modal (que no aparezca abajo)
- [ ] Eliminar campo "Estado" del formulario
- [ ] Eliminar campo "Asesor" del formulario (usar sesión)
- [ ] Autocompletar valores al seleccionar programa
- [ ] Agregar campo "Frecuencia de Pago"
- [ ] Agregar campo "Fecha Primer Compromiso"
- [ ] Agregar columna "Matrícula Pagada" a la tabla
- [ ] Agregar columna "Módulo Actual" a la tabla
- [ ] Agregar indicador visual de estado de pago (al día/mora)

### 9.6 Nueva Vista RECAUDOS (Fusión)

- [ ] Crear Tab "Registrar Pago" con buscador de estudiante
- [ ] Mover historial de pagos a Tab "Historial"
- [ ] Mover cartera a Tab "Cartera"
- [ ] Mostrar tipo de pago: "MATRÍCULA" vs "MÓDULO X"
- [ ] Mantener envío de WhatsApp en ambas tabs

### 9.7 Mejoras a Vista Reportes

- [ ] Agregar Tab "Recaudo" (total, método, asesor, tendencia)
- [ ] Agregar Tab "Cartera" (antigüedad, por asesor, por programa) ⭐ **SUPER IMPORTANTE**
- [ ] Agregar Tab "Matrículas" (por mes, programa, asesor)
- [ ] Agregar filtros globales (período, programa, asesor)
- [ ] Agregar exportación Excel/PDF (especialmente para Cartera)
- [ ] Mover "Cartera Pendiente Detallada" de vista actual a Tab Cartera
- [ ] Reporte de Cartera detallado por vencimientos: 0-30, 31-60, 61-90, +90 días

### 9.8 Configuración (Admin)

- [ ] Agregar gestión de Programas (nombre, valor, matrícula, módulos)
- [ ] Agregar configuración de Meta del Mes
- [ ] Ocultar vista de Prospectos del menú

---

## 10. HISTORIAL DE CAMBIOS

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-01-24 | Creación inicial del documento | Claude |
| 2026-01-24 | Confirmación de reglas: matrícula, módulos, pagos completos, frecuencias | Cliente + Claude |
| 2026-01-24 | Análisis del Panel de Control - Confirmaciones | Claude |
| 2026-01-24 | Análisis de Vista Matrículas (tabla + formulario) | Claude |
| 2026-01-24 | Fusión de vistas Pagos + Cartera → RECAUDOS | Cliente + Claude |
| 2026-01-24 | Decisión de ocultar Prospectos | Cliente |
| 2026-01-24 | Configuración de módulos por programa (no por estudiante) | Cliente |
| 2026-01-24 | Análisis completo de Reportes como experto PO | Claude |
| 2026-01-24 | Estructura de Reportes CONFIRMADA | Cliente |
| 2026-01-24 | Reporte de Cartera marcado como SUPER IMPORTANTE (Excel/PDF por vencimientos) | Cliente |
| 2026-01-24 | Mover "Cartera Pendiente Detallada" a Tab Reportes | Cliente |

---

## 11. PENDIENTES POR CLARIFICAR

### Resueltos ✅
1. ~~¿Valor de matrícula por programa o configurable?~~ → Por programa, en Admin
2. ~~¿Matrícula incluida en valor total o adicional?~~ → Incluida
3. ~~¿Matrícula entrega primer módulo o no?~~ → NO
4. ~~¿Tiempo fijo para entregar taller?~~ → 5 días antes del próximo pago
5. ~~¿Compromisos todos al inicio o uno a uno?~~ → Uno a uno
6. ~~¿Qué frecuencias de pago existen?~~ → Mensual y Quincenal
7. ~~¿Se permiten abonos parciales a un módulo?~~ → NO
8. ~~¿Días de anticipación para recordatorio?~~ → 1, 3, 7 días
9. ~~¿Notificación de mora?~~ → SÍ, en rojo en dashboard
10. ~~¿La "Tasa de Cierre" es prioritaria?~~ → NO, quitarla
11. ~~¿Meta de recaudo mensual?~~ → SÍ, StatCard dedicada
12. ~~¿Recaudo del día como tarjeta?~~ → SÍ
13. ~~¿Filtro por asesor en dashboard?~~ → SÍ
14. ~~Filtros de tiempo en dashboard?~~ → Semanal, Quincenal, Mensual
15. ~~Meta del mes: ubicación?~~ → StatCard dedicada
16. ~~Meta fija o variable?~~ → Variable, configura admin
17. ~~Agregar columnas a tabla estudiantes?~~ → SÍ
18. ~~Mostrar resumen en formulario?~~ → SÍ
19. ~~Matrícula se autocompleta?~~ → SÍ, según programa
20. ~~¿3 vistas o fusionar Pagos+Cartera?~~ → FUSIONAR en "Recaudos"
21. ~~¿Registrar pago desde Recaudos?~~ → SÍ, nueva Tab
22. ~~¿Módulos por programa o por estudiante?~~ → Por PROGRAMA (en Admin)

23. ~~¿Te parece bien la estructura propuesta de Reportes?~~ → SÍ, aprobada
24. ~~¿El reporte "Cartera Pendiente Detallada" se mueve a Tab de Cartera en Reportes?~~ → SÍ, mover a Reportes

### Notas Importantes 📌
- **REPORTE DE CARTERA ES SUPER IMPORTANTE** - Debe tener opción de exportar a Excel y PDF, detallado por vencimientos (0-30, 31-60, 61-90, +90 días)
