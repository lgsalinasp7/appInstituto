---
name: kaledacademy-narrator
description: Construye narrativas concretas usando los tres productos ficticios de KaledSoft (KaledDental, KaledWash, KaledPark) para anclar conceptos técnicos abstractos del bootcamp KaledAcademy. Úsalo cada vez que estés generando contenido de lecciones, retos o quizzes y necesites un ejemplo real, no genérico.
---

# Skill: Narrador de KaledSoft

## Propósito

Guía para construir narrativas concretas usando los tres productos ficticios de **KaledSoft** como ancla de cada concepto técnico del bootcamp KaledAcademy. KaledSoft es el universo narrativo constante del bootcamp — sin él, los conceptos abstractos pierden tracción con principiantes.

## Los tres productos

| Producto       | Contexto                              | Usuarios típicos                | Ejemplo de operación diaria              |
|----------------|---------------------------------------|---------------------------------|------------------------------------------|
| **KaledDental** | SaaS para clínicas odontológicas     | Dentistas, recepción, pacientes | Agendar cita, ver historia clínica, cobrar |
| **KaledWash**   | SaaS para lavanderías y lavaderos    | Dueños, operadores, clientes    | Recibir prenda/auto, lavar, notificar listo, cobrar |
| **KaledPark**   | SaaS para parqueaderos               | Administradores, vigilantes     | Registrar entrada, calcular tarifa, cobrar salida |

## Patrón canónico de narrativa

Cada vez que necesites aterrizar un concepto técnico, sigue este patrón:

```
"Imagina que [Producto] tiene [situación concreta con número o cantidad].
Cada vez que [acción del usuario], el servidor [qué hace sin el concepto].
Sin [concepto], eso significa [consecuencia negativa concreta y dolorosa].
Con [concepto], [beneficio concreto, idealmente con métricas o tiempo]."
```

**Reglas críticas:**
- Siempre usa números concretos ("500 dentistas", "1000 autos al día", "8am pico")
- La consecuencia negativa debe doler (perder dinero, perder cliente, perder datos)
- El beneficio debe ser medible (ms vs segundos, $ ahorrados, % menos errores)
- Habla en presente simple, no en condicional

## Ejemplos por categoría de concepto

### Performance / velocidad

> "KaledDental tiene 500 dentistas haciendo login a las 8am en lunes. Sin caché, eso son 500 queries simultáneas a la base de datos. La página tarda 4 segundos en cargar y los dentistas pierden los primeros 5 minutos del día mirando un spinner. Con Redis, la segunda consulta responde en 1ms en vez de 200ms y la página carga en 200ms."

### Seguridad / autenticación

> "KaledPark necesita que solo el administrador pueda ver los reportes de ingresos del mes. Sin autenticación con JWT, cualquier persona con la URL `kaledpark.com/reportes` podría ver cuánto factura el parqueadero — incluyendo competidores. Con auth, el servidor exige un token válido y rechaza el 401."

### Datos / APIs

> "KaledWash quiere que sus clientes vean el estado de su ropa en tiempo real desde el celular: 'recibida', 'lavando', 'lista para recoger'. La app móvil le pregunta al servidor cada 5 segundos: '¿ya terminó la lavadora?'. Eso es exactamente una API REST en acción — el cliente pregunta, el servidor responde con JSON."

### Bases de datos

> "KaledDental tiene 12.000 pacientes registrados. Sin un índice en la columna `documento`, buscar 'cédula 1023456789' obliga a la BD a leer las 12.000 filas una por una. Con índice, lo encuentra en milisegundos. La diferencia: 8 segundos vs. 30ms cada vez que la recepcionista busca un paciente."

### Git / control de versiones

> "El equipo de KaledPark son 4 desarrolladores. Sin Git, todos editan el mismo archivo `tarifas.js` por Dropbox. Un viernes Juan sobrescribe los cambios de María sin querer y pierden 3 días de trabajo. Con Git, cada uno tiene su rama y ningún cambio se pisa sin que alguien lo apruebe."

### Variables de entorno

> "KaledDental usa Stripe para cobrar consultas. La clave secreta de Stripe vale dinero real — si alguien la roba, puede generar cobros falsos. Si esa clave queda en el código y se sube a GitHub, en menos de 8 horas alguien la encuentra con un bot. Por eso vive en `.env`, fuera del repo, y solo el servidor de producción la conoce."

### Testing

> "KaledWash tiene una función que calcula el precio: $5.000 + $2.000 por cada kilo extra. Un día un developer cambia la fórmula sin querer y empieza a cobrar de menos. En 3 días pierden $400.000 antes de que alguien lo note. Si hubiera un test que diga 'para 5 kilos, espera $11.000', el cambio nunca habría pasado al deploy."

### Deploy / environments

> "KaledPark funciona perfecto en la laptop de Andrés. Lo sube a producción y se rompe: las URLs apuntan a `localhost:3000`. Las variables de entorno de su laptop no son las mismas que las del servidor. Por eso existen los environments: development, staging, production — y cada uno tiene sus propias variables."

---

## Reglas de uso

1. **Mínimo 3 slides por lección** deben tener narrativa KaledSoft
2. **Varía el producto** — no uses siempre KaledDental. Rotación sugerida:
   - Conceptos de UI/UX → KaledDental (es el más visual)
   - Conceptos de operaciones diarias → KaledWash (recibir/procesar/entregar)
   - Conceptos de seguridad y dinero → KaledPark (control de acceso, tarifas)
3. **Cada quiz** del agente `/kaledacademy:quiz` debe tener al menos 2-3 preguntas con escenario KaledSoft
4. **Cada reto CRAL** del agente `/kaledacademy:cral` debe estar ambientado en uno de los tres productos
5. **Cada reto de criterio** del agente `/kaledacademy:ai-criterion` debe simular código generado para uno de los tres productos
6. **Cada entregable** del agente `/kaledacademy:deliverable` debe pedir construir algo para uno de los tres productos

## Anti-patrones (NO hacer)

- ❌ "Imagina una empresa de software..." (genérico, sin tracción)
- ❌ "Una app cualquiera..." (no aprovecha el universo narrativo)
- ❌ "Por ejemplo Twitter..." (no es KaledSoft)
- ❌ Mencionar Big Tech (Google, Meta, Netflix) cuando puedes usar KaledDental
- ❌ Inventar productos nuevos de KaledSoft que no son los tres oficiales
- ❌ Narrativas sin números ni consecuencias concretas
