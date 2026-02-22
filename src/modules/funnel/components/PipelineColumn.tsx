'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadCard } from './LeadCard'
import { cn } from '@/lib/utils'
import type { PipelineStage, PipelineLead } from '../types'

interface PipelineColumnProps {
  stage: PipelineStage
  onLeadClick: (lead: PipelineLead) => void
}

export function PipelineColumn({ stage, onLeadClick }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.stage,
  })

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={cn(
        'h-full flex flex-col',
        isOver && 'ring-2 ring-primary'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{stage.label}</h3>
            <Badge variant="secondary" className="ml-2">
              {stage.count}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto min-h-[200px] pt-0">
          <SortableContext
            items={stage.leads.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div ref={setNodeRef} className="space-y-2">
              {stage.leads.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No hay leads en esta etapa
                </div>
              ) : (
                stage.leads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={() => onLeadClick(lead)}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  )
}
