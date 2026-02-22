'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeadScoreBadge } from './LeadScoreBadge'
import { LeadTimeline } from './LeadTimeline'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { PipelineLead, LeadTimeline as LeadTimelineType } from '../types'
import { FUNNEL_STAGE_LABELS, SOURCE_LABELS, TEMPERATURE_LABELS } from '../types'
import {
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  User,
  Calendar,
  RotateCcw,
  Loader2
} from 'lucide-react'

interface LeadDetailDrawerProps {
  lead: PipelineLead | null
  open: boolean
  onClose: () => void
  onRefresh?: () => void
}

export function LeadDetailDrawer({ lead, open, onClose, onRefresh }: LeadDetailDrawerProps) {
  const [timeline, setTimeline] = useState<LeadTimelineType | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && lead) {
      fetchTimeline()
    } else {
      setTimeline(null)
    }
  }, [open, lead])

  const fetchTimeline = async () => {
    if (!lead) return

    setLoading(true)
    try {
      const res = await fetch(`/api/funnel/leads/${lead.id}/timeline`)
      const json = await res.json()
      if (json.success) {
        setTimeline(json.data)
      }
    } catch (error) {
      console.error('Error fetching timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculateScore = async () => {
    if (!lead) return

    setLoading(true)
    try {
      const res = await fetch(`/api/funnel/scoring/${lead.id}`, {
        method: 'POST',
      })
      const json = await res.json()
      if (json.success) {
        onRefresh?.()
      }
    } catch (error) {
      console.error('Error recalculating score:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl">{lead.name}</SheetTitle>
              <SheetDescription className="mt-1">
                {FUNNEL_STAGE_LABELS[lead.funnelStage]} • {SOURCE_LABELS[lead.source]}
              </SheetDescription>
            </div>
            <LeadScoreBadge score={lead.score} temperature={lead.temperature} className="text-base px-3 py-1" />
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">Información de Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{lead.phone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{lead.email}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            {lead.programName && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span>Programa</span>
                </div>
                <p className="font-medium">{lead.programName}</p>
              </div>
            )}
            {lead.advisorName && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Asesor</span>
                </div>
                <p className="font-medium">{lead.advisorName}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">Métricas</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Temperatura</p>
                <p className="font-semibold">{TEMPERATURE_LABELS[lead.temperature]}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Puntuación</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{lead.score}/100</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleRecalculateScore}
                    disabled={loading}
                    className="h-6 px-2"
                  >
                    {loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              {lead.lastContactAt && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Último Contacto</p>
                  <p className="font-semibold text-xs">
                    {format(new Date(lead.lastContactAt), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
              )}
              {lead.nextFollowUpAt && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Próximo Seguimiento</p>
                  <p className="font-semibold text-xs">
                    {format(new Date(lead.nextFollowUpAt), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
              )}
              <div className="p-3 bg-muted rounded-lg col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Fecha de Creación</p>
                <p className="font-semibold text-xs">
                  {format(new Date(lead.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase">Actividad</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : timeline ? (
              <LeadTimeline items={timeline.interactions} />
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No se pudo cargar el timeline
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
