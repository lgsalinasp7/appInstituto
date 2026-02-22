'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import type { TimelineItem } from '../types'
import {
  Phone,
  Mail,
  MessageCircle,
  StickyNote,
  ArrowRight,
  Bot,
  User,
  Calendar,
  Link as LinkIcon
} from 'lucide-react'
import type { InteractionType } from '@prisma/client'

interface LeadTimelineProps {
  items: TimelineItem[]
}

const INTERACTION_CONFIG: Record<InteractionType, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}> = {
  LLAMADA: {
    icon: Phone,
    label: 'Llamada',
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  WHATSAPP_ENVIADO: {
    icon: MessageCircle,
    label: 'WhatsApp Enviado',
    color: 'text-green-600 bg-green-50 border-green-200'
  },
  WHATSAPP_RECIBIDO: {
    icon: MessageCircle,
    label: 'WhatsApp Recibido',
    color: 'text-green-700 bg-green-100 border-green-300'
  },
  EMAIL_ENVIADO: {
    icon: Mail,
    label: 'Email Enviado',
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  EMAIL_RECIBIDO: {
    icon: Mail,
    label: 'Email Recibido',
    color: 'text-purple-700 bg-purple-100 border-purple-300'
  },
  NOTA: {
    icon: StickyNote,
    label: 'Nota',
    color: 'text-amber-600 bg-amber-50 border-amber-200'
  },
  CAMBIO_ETAPA: {
    icon: ArrowRight,
    label: 'Cambio de etapa',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
  },
  REUNION: {
    icon: User,
    label: 'Reunión',
    color: 'text-blue-700 bg-blue-100 border-blue-300'
  },
  MASTERCLASS: {
    icon: Calendar,
    label: 'Masterclass',
    color: 'text-rose-600 bg-rose-50 border-rose-200'
  },
  SISTEMA: {
    icon: Bot,
    label: 'Sistema',
    color: 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

export function LeadTimeline({ items }: LeadTimelineProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No hay interacciones registradas
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const config = INTERACTION_CONFIG[item.type]
        const Icon = config.icon
        const isLast = index === items.length - 1

        return (
          <div key={item.id} className="flex gap-3">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className={`rounded-full p-2 ${config.color} border`}>
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && (
                <div className="w-px h-full bg-border mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{config.label}</span>
                  {item.agentType && (
                    <Badge variant="outline" className="text-xs">
                      <Bot className="h-3 w-3 mr-1" />
                      {item.agentType}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm', { locale: es })}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{item.content}</p>

              {item.advisorName && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{item.advisorName}</span>
                </div>
              )}

              {item.metadata && Object.keys(item.metadata).length > 0 && (
                <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(item.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
