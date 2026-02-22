/**
 * TypingIndicator - Indicador de "escribiendo..."
 */

"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3">
        <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-white"></div>
      </div>
    </div>
  );
}
