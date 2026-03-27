/** Compatible con DOM (`number`) y tipos Node (`Timeout`) al compilar con @types/node. */
export type TimerHandle = ReturnType<typeof globalThis.setTimeout>;

export type SubstepTimers = {
  push(id: TimerHandle): void;
};

/** Acumula handles de `setTimeout` para limpiarlos al cambiar de paso o desmontar. */
export function createSubstepTimers(): SubstepTimers & { clear(): void } {
  const ids: TimerHandle[] = [];
  return {
    push(id: TimerHandle) {
      ids.push(id);
    },
    clear() {
      ids.forEach((h) => {
        clearTimeout(h);
      });
      ids.length = 0;
    },
  };
}
