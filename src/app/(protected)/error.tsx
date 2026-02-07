"use client";

/**
 * Protected Routes Error Boundary
 * Captura errores específicos en rutas protegidas
 */

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error en ruta protegida:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error en la aplicación
          </h1>

          <p className="text-gray-600 mb-6">
            Ha ocurrido un error al procesar su solicitud. Por favor, intente nuevamente o regrese al panel principal.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-sm font-semibold text-red-900 mb-1">
                Información de desarrollo:
              </p>
              <p className="text-sm font-mono text-red-800 break-words">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer">
                    Ver stack trace
                  </summary>
                  <pre className="text-xs text-red-700 mt-2 overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Intentar nuevamente</span>
            </button>

            <button
              onClick={() => window.location.href = "/"}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Ir al dashboard</span>
            </button>
          </div>

          {error.digest && (
            <p className="text-xs text-gray-400 mt-6">
              ID de error: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
