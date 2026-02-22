import { PipelineBoard } from '@/modules/funnel/components'

export const metadata = {
  title: 'Pipeline de Ventas',
  description: 'Gestión del embudo de ventas y seguimiento de leads',
}

export default function PipelinePage() {
  return (
    <div className="container mx-auto py-6">
      <PipelineBoard />
    </div>
  )
}
