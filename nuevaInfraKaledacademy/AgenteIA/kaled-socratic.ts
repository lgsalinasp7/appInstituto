// lib/academia/kaled-socratic.ts
// Kaled nunca da la respuesta directa.
// Siempre guía con preguntas que llevan al estudiante a pensar.

export const SOCRATIC_PATTERNS = {
    // Cuando el estudiante pide que Kaled haga algo por él
    DOING_FOR_STUDENT: [
      "Antes de que te muestre cómo hacerlo, cuéntame: ¿qué intentaste tú primero?",
      "Interesante pregunta. ¿Qué crees tú que debería pasar si implementas eso?",
      "Antes de avanzar, ¿puedes decirme cuál es el problema específico que estás tratando de resolver?",
      "¿Ya intentaste algo? Muéstrame lo que llevas y te ayudo a encontrar el camino.",
    ],
  
    // Cuando el estudiante tiene un error
    HAS_ERROR: [
      "¿Qué dice exactamente el mensaje de error? ¿Qué crees tú que significa?",
      "Antes de buscar la solución, ¿puedes explicarme qué hace línea por línea el código que tienes?",
      "¿En qué línea exactamente falla? ¿Qué valor tiene esa variable en ese momento?",
      "Si tuvieras que adivinar por qué falla, ¿cuál sería tu hipótesis?",
    ],
  
    // Cuando el estudiante quiere que Kaled valide su código
    WANTS_VALIDATION: [
      "¿Qué pasa si este código recibe 10.000 registros en lugar de 10? ¿Escala?",
      "¿Qué sucede si un usuario malintencionado envía datos inesperados aquí?",
      "¿Podrías explicarme qué hace cada parte de este código como si yo fuera un estudiante nuevo?",
      "¿Cómo probarías que esto funciona correctamente? ¿Qué casos de prueba considerarías?",
    ],
  
    // Cuando el estudiante está en fase AUDITAR
    AUDITAR: [
      "¿Este código que generó la IA es seguro? ¿Por qué sí o por qué no?",
      "¿Qué cambiarías de este código si supieras que van a usarlo 1000 usuarios simultáneos?",
      "¿Detectas algún problema de seguridad en esta implementación?",
      "¿Qué partes de este código entiendes completamente y cuáles no?",
    ],
  
    // Cuando detecta el mismo error por segunda vez
    RECURRING_ERROR: [
      "Noto que hemos hablado de esto antes. ¿Puedes explicarme con tus propias palabras qué aprendiste la última vez sobre este tema?",
      "Interesante, este patrón apareció también en la sesión anterior. ¿Qué crees que lo conecta?",
      "Antes de continuar, ¿puedes decirme cuál es la diferencia entre lo que hiciste antes y lo que estás haciendo ahora?",
    ],
  } as const;
  
  export function getSocraticResponse(context: {
    isAskingForSolution: boolean;
    hasError: boolean;
    wantsValidation: boolean;
    isRecurringError: boolean;
    cralPhase: string;
  }): string | null {
    // Solo aplica método socrático en ciertos contextos
    if (context.isRecurringError) {
      return randomFrom(SOCRATIC_PATTERNS.RECURRING_ERROR);
    }
    if (context.isAskingForSolution) {
      return randomFrom(SOCRATIC_PATTERNS.DOING_FOR_STUDENT);
    }
    if (context.hasError) {
      return randomFrom(SOCRATIC_PATTERNS.HAS_ERROR);
    }
    if (context.wantsValidation && context.cralPhase === "AUDITAR") {
      return randomFrom(SOCRATIC_PATTERNS.AUDITAR);
    }
    if (context.wantsValidation) {
      return randomFrom(SOCRATIC_PATTERNS.WANTS_VALIDATION);
    }
    return null;
  }
  
  function randomFrom<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  // Detectar si el estudiante está pidiendo que Kaled haga el trabajo
  export function detectsWorkRequest(message: string): boolean {
    const lower = message.toLowerCase();
    const WORK_PATTERNS = [
      "hazme", "haz el", "escribe el código", "dame el código completo",
      "puedes hacer", "crea el componente completo", "termina esto",
      "completa el código", "escríbeme", "genera el código de",
      "dame la solución completa", "resuelve esto", "puedes resolver",
    ];
    return WORK_PATTERNS.some(p => lower.includes(p));
  }
  
  // Detectar si tiene un error activo
  export function detectsError(message: string): boolean {
    const lower = message.toLowerCase();
    return lower.includes("error") || lower.includes("no funciona") ||
      lower.includes("falla") || lower.includes("undefined") ||
      lower.includes("cannot read") || lower.includes("is not a function");
  }