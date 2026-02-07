/**
 * Suspended Page
 * Página mostrada cuando un tenant está suspendido o cancelado
 */

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, Mail, Phone } from "lucide-react";

async function getTenantInfo() {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (!tenantSlug) {
    return null;
  }

  return await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    select: {
      name: true,
      status: true,
      email: true,
    },
  });
}

export default async function SuspendedPage() {
  const tenant = await getTenantInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cuenta Suspendida
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            {tenant?.status === 'CANCELADO' 
              ? `La cuenta de ${tenant?.name || 'esta institución'} ha sido cancelada.`
              : `La cuenta de ${tenant?.name || 'esta institución'} se encuentra temporalmente suspendida.`
            }
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">
              ¿Por qué veo este mensaje?
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>La cuenta puede estar suspendida por falta de pago</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>Puede haber problemas con la información de facturación</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>La cuenta puede haber sido cancelada voluntariamente</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">
              Para reactivar tu cuenta, por favor contacta a soporte:
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {tenant?.email && (
                <a
                  href={`mailto:${tenant.email}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>Enviar Email</span>
                </a>
              )}

              <a
                href="mailto:soporte@kaledsoft.tech"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>Contactar a KaledSoft</span>
              </a>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              ID de la cuenta: {tenant?.name || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
