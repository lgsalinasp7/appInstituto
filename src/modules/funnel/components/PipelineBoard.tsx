'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { PipelineColumn } from './PipelineColumn'
import { PipelineFilters } from './PipelineFilters'
import { LeadCard } from './LeadCard'
import { LeadDetailDrawer } from './LeadDetailDrawer'
import { FunnelChart } from './FunnelChart'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import type { PipelineView, PipelineLead } from '../types'
import type { PipelineFiltersInput } from '../schemas'
import type { FunnelStage } from '@prisma/client'
import { RefreshCcw, LayoutGrid, BarChart3, Loader2 } from 'lucide-react'

interface PipelineBoardProps {
  tenantSlug?: string
}

export function PipelineBoard({ tenantSlug }: PipelineBoardProps) {
  const [pipeline, setPipeline] = useState<PipelineView | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<PipelineFiltersInput>({})
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchPipeline = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.stage) params.append('stage', filters.stage)
      if (filters.temperature) params.append('temperature', filters.temperature)
      if (filters.source) params.append('source', filters.source)
      if (filters.advisorId) params.append('advisorId', filters.advisorId)
      if (filters.search) params.append('search', filters.search)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const res = await fetch(`/api/funnel/pipeline?${params.toString()}`, {
        headers: tenantSlug ? { 'x-tenant-slug': tenantSlug } : {}
      })
      const json = await res.json()

      if (json.success) {
        setPipeline(json.data)
      } else {
        toast({
          title: 'Error',
          description: json.error || 'Error al cargar el pipeline',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar el pipeline',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [filters, tenantSlug, toast])

  useEffect(() => {
    fetchPipeline()
  }, [fetchPipeline])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !pipeline) return

    const leadId = active.id as string
    const newStage = over.id as FunnelStage

    // Find the lead being dragged
    let lead: PipelineLead | null = null
    let oldStage: FunnelStage | null = null

    for (const stage of pipeline.stages) {
      const foundLead = stage.leads.find(l => l.id === leadId)
      if (foundLead) {
        lead = foundLead
        oldStage = stage.stage
        break
      }
    }

    if (!lead || !oldStage || oldStage === newStage) return

    try {
      // Optimistic update
      const updatedStages = pipeline.stages.map(stage => {
        if (stage.stage === oldStage) {
          return {
            ...stage,
            leads: stage.leads.filter(l => l.id !== leadId),
            count: stage.count - 1
          }
        }
        if (stage.stage === newStage) {
          return {
            ...stage,
            leads: [...stage.leads, { ...lead!, funnelStage: newStage }],
            count: stage.count + 1
          }
        }
        return stage
      })

      setPipeline({ ...pipeline, stages: updatedStages })

      // Make API call
      const res = await fetch(`/api/funnel/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(tenantSlug ? { 'x-tenant-slug': tenantSlug } : {})
        },
        body: JSON.stringify({ newStage })
      })

      const json = await res.json()

      if (!json.success) {
        // Revert on error
        fetchPipeline()
        toast({
          title: 'Error',
          description: json.error || 'Error al mover el lead',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Lead movido',
          description: `Lead movido a ${newStage}`,
        })
      }
    } catch (error) {
      // Revert on error
      fetchPipeline()
      toast({
        title: 'Error',
        description: 'Error al mover el lead',
        variant: 'destructive'
      })
    }
  }

  const handleLeadClick = (lead: PipelineLead) => {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  const activeLead = activeId
    ? pipeline?.stages.flatMap(s => s.leads).find(l => l.id === activeId)
    : null

  if (loading && !pipeline) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!pipeline) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No se pudo cargar el pipeline
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pipeline de Ventas</h1>
          <p className="text-muted-foreground">
            {pipeline.totalLeads} leads totales • ${pipeline.totalValue.toLocaleString()} valor potencial
          </p>
        </div>
        <Button
          onClick={() => fetchPipeline()}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCcw className="h-4 w-4 mr-2" />
          )}
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <PipelineFilters onFilterChange={setFilters} />

      {/* Content */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="chart" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pipeline.stages.map(stage => (
                <PipelineColumn
                  key={stage.stage}
                  stage={stage}
                  onLeadClick={handleLeadClick}
                />
              ))}
            </div>

            <DragOverlay>
              {activeLead ? (
                <LeadCard lead={activeLead} onClick={() => {}} />
              ) : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        <TabsContent value="chart" className="mt-6">
          <FunnelChart stages={pipeline.stages} />
        </TabsContent>
      </Tabs>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedLead(null)
        }}
        onRefresh={fetchPipeline}
      />
    </div>
  )
}
