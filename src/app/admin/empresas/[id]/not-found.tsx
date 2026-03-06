import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";

export default function EmpresaNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="glass-card rounded-2xl p-8 sm:p-12 max-w-md text-center border border-slate-800/50">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-8 h-8 text-slate-500" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Empresa no encontrada</h1>
        <p className="text-slate-400 text-sm mb-6">
          La empresa que buscas no existe o fue eliminada. Verifica el enlace o vuelve al listado.
        </p>
        <Link href="/admin/empresas">
          <Button className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
            <ArrowLeft className="w-4 h-4" />
            Volver a Empresas
          </Button>
        </Link>
      </div>
    </div>
  );
}
