"use client";

/**
 * Root Error Boundary
 * Captura errores no manejados en toda la aplicación
 */

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log del error a servicio de monitoreo (ej: Sentry)
    console.error("Error capturado por Error Boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </h1>

          <p className="text-gray-600 mb-6">
            Lo sentimos, ha ocurrido un error inesperado. Por favor, intente nuevamente.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-mono text-red-800 break-words">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Intentar nuevamente
            </button>

            <button
              onClick={() => window.location.href = "/"}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ir al inicio
            </button>
          </div>

          {error.digest && (
            <p className="text-xs text-gray-400 mt-6">
              Código de error: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
