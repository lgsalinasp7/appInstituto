# 💬 Ejemplos de Prompts para el Agente IA

## Categorías de Preguntas

---

## 📊 Estadísticas y Recaudos

### Básicas
- "¿Cuál es el recaudo del día?"
- "Dame las estadísticas de este mes"
- "¿Cuántos estudiantes tenemos en total?"
- "¿Cuántos estudiantes nuevos ingresaron este mes?"

### Comparativas
- "¿Cómo va el recaudo comparado con el mes anterior?"
- "¿Está creciendo o bajando el recaudo?"
- "Muéstrame la tendencia de este mes"

### Específicas
- "¿Cuánto hemos recaudado este mes?"
- "¿Cuál fue el recaudo del mes anterior?"
- "¿Cuántos estudiantes están activos?"

---

## 🎓 Programas Académicos

### Listar programas
- "Muéstrame los programas disponibles"
- "¿Qué programas ofrece la institución?"
- "Lista todos los programas activos"

### Info específica
- "¿Cuánto cuesta el programa de [nombre]?"
- "¿Cuántos módulos tiene el programa de [nombre]?"
- "Dame información del programa [nombre]"

### Comparar
- "¿Cuál es el programa más costoso?"
- "¿Qué programa tiene más módulos?"

---

## 💰 Cartera y Mora

### Resumen
- "Dame un resumen de cartera"
- "¿Cuántos compromisos tengo pendientes?"
- "¿Cuánto tenemos en cartera?"

### Mora
- "¿Cuánto tenemos en mora?"
- "¿Cuántos estudiantes están en mora?"
- "Muéstrame el reporte de antigüedad de cartera"

### Vencimientos
- "¿Cuántos compromisos vencen hoy?"
- "¿Hay compromisos que vencen mañana?"
- "¿Qué compromisos vencen esta semana?"

### Alertas
- "Muéstrame las alertas de cartera"
- "¿Hay compromisos vencidos?"
- "¿Qué compromisos están próximos a vencer?"

---

## 🔍 Búsqueda de Estudiantes

### Por nombre
- "Busca estudiantes con nombre Juan"
- "¿Tenemos algún estudiante que se llame María?"
- "Muéstrame estudiantes con apellido Rodríguez"

### Por documento
- "Busca el estudiante con cédula 12345678"
- "¿Quién es el estudiante con documento 98765432?"

### Por estado
- "¿Cuántos estudiantes están activos?"
- "Muéstrame estudiantes inactivos"
- "¿Hay estudiantes graduados?"

---

## 📈 Reportes Combinados

### Multi-dimensionales
- "Dame un panorama general del sistema"
- "¿Cómo está el negocio hoy?"
- "Muéstrame un resumen ejecutivo"

### Específicos por área
- "¿Cómo va el área de pagos?"
- "Dame información sobre la cartera"
- "¿Qué tal van las matrículas?"

---

## ❓ Ayuda sobre la Plataforma

### Funcionalidades
- "¿Qué puedes hacer?"
- "¿Cómo puedo matricular un estudiante?"
- "¿Cómo registro un pago?"

### Navegación
- "¿Dónde encuentro los reportes?"
- "¿Cómo veo mi cartera?"
- "¿Dónde están los programas?"

---

## 🔄 Conversaciones Multi-turn

### Ejemplo 1: Profundizar en datos
```
Usuario: "¿Cuántos estudiantes tenemos?"
IA: "Tenemos X estudiantes en total..."
Usuario: "¿Y cuántos están activos?"
IA: "De esos X, Y están activos..."
Usuario: "¿Cuántos ingresaron este mes?"
IA: "Este mes ingresaron Z estudiantes nuevos..."
```

### Ejemplo 2: Explorar cartera
```
Usuario: "Dame un resumen de cartera"
IA: "Aquí está el resumen de cartera..."
Usuario: "¿Cuántos compromisos vencen hoy?"
IA: "Hoy vencen N compromisos..."
Usuario: "Muéstrame las alertas"
IA: "Aquí están las alertas de cartera..."
```

### Ejemplo 3: Buscar y profundizar
```
Usuario: "Busca estudiantes con nombre Juan"
IA: "Encontré 5 estudiantes llamados Juan..."
Usuario: "¿Cuánto debe Juan Pérez?"
IA: "Juan Pérez tiene un saldo pendiente de..."
Usuario: "¿En qué programa está?"
IA: "Juan Pérez está matriculado en el programa..."
```

---

## ⚠️ Casos Límite

### Sin resultados
- "Busca estudiante con cédula 99999999" (no existe)
- Respuesta esperada: "No encontré estudiantes con ese documento"

### Preguntas ambiguas
- "¿Cómo va todo?"
- Respuesta esperada: IA pedirá clarificación o dará panorama general

### Fuera de alcance
- "¿Qué hora es?"
- Respuesta esperada: IA redirigirá a sus capacidades

---

## 💡 Tips para Mejores Resultados

### ✅ Hacer
- Ser específico: "recaudo del día" mejor que "recaudo"
- Usar nombres completos de programas
- Especificar períodos: "este mes", "hoy", "esta semana"
- Pedir aclaraciones si no entiendes la respuesta

### ❌ Evitar
- Preguntas muy generales: "dime algo"
- Nombres incompletos o abreviaciones no estándar
- Múltiples preguntas en un solo mensaje
- Lenguaje técnico excesivo

---

## 🎯 Casos de Uso Reales

### Inicio del día (Asesor)
1. "¿Cuál es el recaudo del día?"
2. "¿Cuántos compromisos vencen hoy?"
3. "Muéstrame las alertas de cartera"

### Reporte semanal (Director)
1. "Dame las estadísticas de esta semana"
2. "¿Cuántos estudiantes nuevos ingresaron?"
3. "¿Cómo va el recaudo comparado con el mes anterior?"

### Consulta de estudiante (Recepción)
1. "Busca estudiante con cédula [número]"
2. "¿En qué programa está matriculado?"
3. "¿Cuánto debe?"

### Análisis de cartera (Cartera)
1. "Dame un resumen de cartera"
2. "Muéstrame el reporte de antigüedad"
3. "¿Cuántos compromisos están en mora?"

---

## 🔧 Testing por Herramienta

### getStudentStats
```
✅ "¿Cuál es el recaudo del día?"
✅ "Dame las estadísticas de este mes"
✅ "¿Cuántos estudiantes tenemos?"
```

### getProgramInfo
```
✅ "Muéstrame los programas disponibles"
✅ "¿Cuánto cuesta el programa de [nombre]?"
✅ "Lista todos los programas activos"
```

### getCarteraReport (summary)
```
✅ "Dame un resumen de cartera"
✅ "¿Cuántos compromisos tengo pendientes?"
```

### getCarteraReport (aging)
```
✅ "¿Cuánto tenemos en mora?"
✅ "Muéstrame el reporte de antigüedad de cartera"
```

### getCarteraReport (alerts)
```
✅ "Muéstrame las alertas de cartera"
✅ "¿Hay compromisos vencidos?"
✅ "¿Cuántos compromisos vencen hoy?"
```

### searchStudents
```
✅ "Busca estudiantes con nombre Juan"
✅ "Busca el estudiante con cédula 12345678"
```

---

## 📝 Notas

- El agente responde en **español de Colombia**
- Montos en formato **COP** (pesos colombianos)
- Fechas en formato **dd/mm/yyyy**
- Todas las consultas están filtradas por **tenant** automáticamente
- El contexto de la conversación se mantiene entre mensajes

---

## 🚀 Próximas Capacidades (Roadmap)

### En desarrollo
- Agendar compromisos
- Generar gráficos de recaudo
- Reportes de rendimiento de asesores

### Planeadas
- Export de conversaciones a PDF
- Análisis predictivo de mora
- Recomendaciones automáticas
