export const metadata = {
  title: 'Pipeline deshabilitado',
  description: 'Módulo de leads/funnel deshabilitado para tenants',
}

export default function PipelinePage() {
  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
        <h1 className="text-lg font-semibold text-amber-200">Módulo deshabilitado</h1>
        <p className="mt-2 text-sm text-amber-100/90">
          El flujo de leads y embudo para tenants fue retirado para mantener separación estricta con la
          plataforma principal de KaledSoft.
        </p>
      </div>
    </div>
  )
}
