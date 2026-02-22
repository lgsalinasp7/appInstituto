'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadScoreBadge } from './LeadScoreBadge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PipelineLead } from '../types'
import { SOURCE_LABELS } from '../types'
import {
  Phone,
  Mail,
  User,
  Calendar,
  GraduationCap,
  Clock
} from 'lucide-react'

interface LeadCardProps {
  lead: PipelineLead
  onClick: () => void
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date()

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'p-3 cursor-pointer hover:shadow-md transition-shadow mb-2',
        isDragging && 'opacity-50',
        isOverdue && 'border-red-500 border-2'
      )}
    >
      {/* Header: Name + Score */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-sm line-clamp-1 flex-1">
          {lead.name}
        </h4>
        <LeadScoreBadge score={lead.score} temperature={lead.temperature} />
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span className="line-clamp-1">{lead.phone}</span>
        </div>
        {lead.email && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span className="line-clamp-1">{lead.email}</span>
          </div>
        )}
      </div>

      {/* Program */}
      {lead.programName && (
        <div className="flex items-center gap-1.5 text-xs mb-2">
          <GraduationCap className="h-3 w-3 text-primary" />
          <span className="line-clamp-1 font-medium">{lead.programName}</span>
        </div>
      )}

      {/* Footer: Advisor + Source */}
      <div className="flex items-center justify-between text-xs">
        {lead.advisorName && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="line-clamp-1">{lead.advisorName}</span>
          </div>
        )}
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {SOURCE_LABELS[lead.source]}
        </Badge>
      </div>

      {/* Next Follow Up */}
      {lead.nextFollowUpAt && (
        <div className={cn(
          "flex items-center gap-1 text-xs mt-2 pt-2 border-t",
          isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"
        )}>
          <Clock className="h-3 w-3" />
          <span>
            {isOverdue ? 'Vencido: ' : 'Seguimiento: '}
            {formatDistanceToNow(new Date(lead.nextFollowUpAt), {
              addSuffix: true,
              locale: es
            })}
          </span>
        </div>
      )}

      {/* Last Contact */}
      {lead.lastContactAt && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
          <Calendar className="h-3 w-3" />
          <span>
            Último contacto: {formatDistanceToNow(new Date(lead.lastContactAt), {
              addSuffix: true,
              locale: es
            })}
          </span>
        </div>
      )}
    </Card>
  )
}
